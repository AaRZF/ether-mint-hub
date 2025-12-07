import { useState, useCallback, useEffect } from "react";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import { connectWallet as connectWalletUtil, shortenAddress } from "@/lib/web3";

interface WalletState {
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  address: string | null;
  isConnecting: boolean;
  error: string | null;
}

export const useWallet = () => {
  const [state, setState] = useState<WalletState>({
    provider: null,
    signer: null,
    address: null,
    isConnecting: false,
    error: null,
  });

  const connect = useCallback(async () => {
    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      const { provider, signer, address } = await connectWalletUtil();
      setState({
        provider,
        signer,
        address,
        isConnecting: false,
        error: null,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: error instanceof Error ? error.message : "Failed to connect wallet",
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({
      provider: null,
      signer: null,
      address: null,
      isConnecting: false,
      error: null,
    });
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: unknown) => {
      const accountsList = accounts as string[];
      if (accountsList.length === 0) {
        disconnect();
      } else if (state.address && accountsList[0] !== state.address) {
        connect();
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);

    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, [state.address, connect, disconnect]);

  return {
    ...state,
    isConnected: !!state.address,
    shortAddress: state.address ? shortenAddress(state.address) : null,
    connect,
    disconnect,
  };
};
