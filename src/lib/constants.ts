const LOCAL_API_FALLBACK = "http://localhost:8000";
const params = new URLSearchParams(window.location.search);
const manualApiOverride = params.get("api");
const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const defaultApiBase = isLocalhost ? LOCAL_API_FALLBACK : window.location.origin;
export const API_BASE = (manualApiOverride ?? defaultApiBase).replace(/\/$/, "");

export const API_ENDPOINTS = {
  listings: `${API_BASE}/api/listings`,
  upload: `${API_BASE}/api/nft/upload`,
  reindex: `${API_BASE}/api/reindex`,
  config: `${API_BASE}/api/config`,
};

export let MARKETPLACE_ADDRESS = "0xD089b7B482523405b026DF2a5caD007093252b15";
export let NFT_CONTRACT_ADDRESS = "0xDB9d9Bb58dB6774bbD72a9cBefb483F03Db1A5Fe";

export const setMarketplaceAddress = (address: string) => {
  MARKETPLACE_ADDRESS = address;
};

export const setNftContractAddress = (address: string) => {
  NFT_CONTRACT_ADDRESS = address;
};

export const MARKETPLACE_ABI = [
  "function buyItem(address nftAddress, uint256 tokenId) payable",
  "function listItem(address nftAddress, uint256 tokenId, uint256 price)",
];

export const NFT_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "function mint(string uri) returns (uint256)",
  "function approve(address to, uint256 tokenId)",
  "function setApprovalForAll(address operator, bool approved)",
  "function isApprovedForAll(address owner, address operator) view returns (bool)",
];
