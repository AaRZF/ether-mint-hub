import { BrowserProvider, JsonRpcSigner, Contract, parseUnits, getAddress } from "ethers";
import {
  MARKETPLACE_ADDRESS,
  NFT_CONTRACT_ADDRESS,
  MARKETPLACE_ABI,
  NFT_ABI,
  API_ENDPOINTS,
  setMarketplaceAddress,
  setNftContractAddress,
} from "./constants";
import type { BackendConfig } from "@/types/nft";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
    };
  }
}

export const shortenAddress = (address: string = ""): string => {
  if (!address || address.length < 10) return address || "N/A";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const loadBackendConfig = async (): Promise<void> => {
  try {
    const resp = await fetch(API_ENDPOINTS.config);
    if (!resp.ok) return;
    const cfg: BackendConfig = await resp.json();
    if (cfg?.marketplaceAddress) {
      setMarketplaceAddress(cfg.marketplaceAddress);
    }
    if (cfg?.nftContractAddress) {
      setNftContractAddress(cfg.nftContractAddress);
    }
  } catch {
    // Config endpoint might not exist
  }
};

export const connectWallet = async (): Promise<{
  provider: BrowserProvider;
  signer: JsonRpcSigner;
  address: string;
}> => {
  if (!window.ethereum) {
    throw new Error("MetaMask (or another EIP-1193 wallet) is required.");
  }

  const provider = new BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  return { provider, signer, address };
};

export const buyNFT = async (
  signer: JsonRpcSigner,
  nftAddress: string,
  tokenId: string,
  priceWei: string
): Promise<string> => {
  const contract = new Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, signer);
  const tx = await contract.buyItem(nftAddress, tokenId, { value: priceWei });
  await tx.wait();
  return tx.hash;
};

export const mintAndListNFT = async (
  signer: JsonRpcSigner,
  provider: BrowserProvider,
  tokenURI: string,
  priceEth: number,
  onStatusUpdate: (status: string) => void
): Promise<string> => {
  const userAddress = await signer.getAddress();

  // Validate addresses
  try {
    getAddress(NFT_CONTRACT_ADDRESS);
    getAddress(MARKETPLACE_ADDRESS);
  } catch {
    throw new Error("Invalid contract address format.");
  }

  const priceWei = parseUnits(priceEth.toString(), 18);

  onStatusUpdate("Minting NFT on-chain...");
  const nft = new Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, signer);
  const txMint = await nft.mint(tokenURI);
  const receiptMint = await txMint.wait();

  let mintedTokenId: bigint | null = null;

  for (const log of receiptMint.logs ?? []) {
    if (log.address.toLowerCase() !== NFT_CONTRACT_ADDRESS.toLowerCase()) continue;
    try {
      const parsed = nft.interface.parseLog(log);
      if (parsed && parsed.name === "Transfer") {
        mintedTokenId = parsed.args.tokenId ?? parsed.args[2];
        break;
      }
    } catch {
      // Not a parseable log
    }
  }

  if (mintedTokenId === null) {
    throw new Error("Unable to determine minted tokenId from receipt logs");
  }

  const tokenIdStr = mintedTokenId.toString();

  onStatusUpdate("Approving marketplace...");

  try {
    const isApproved = await nft.isApprovedForAll(userAddress, MARKETPLACE_ADDRESS);
    if (!isApproved) {
      const approveAllTx = await nft.setApprovalForAll(MARKETPLACE_ADDRESS, true);
      await approveAllTx.wait();
    }
  } catch {
    const approveTx = await nft.approve(MARKETPLACE_ADDRESS, tokenIdStr);
    await approveTx.wait();
  }

  onStatusUpdate("Creating marketplace listing...");
  const market = new Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, signer);
  const txList = await market.listItem(NFT_CONTRACT_ADDRESS, tokenIdStr, priceWei);
  await txList.wait();

  return tokenIdStr;
};

export const triggerReindex = async (): Promise<void> => {
  try {
    await fetch(API_ENDPOINTS.reindex, { method: "POST" });
  } catch {
    // Reindex might fail silently
  }
};
