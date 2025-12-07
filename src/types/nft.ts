export interface NFTListing {
  token_id: string;
  nft_address: string;
  seller_address: string;
  price_eth: string;
  price_wei: string;
  name?: string;
  image_url?: string;
}

export interface MintFormData {
  name: string;
  description: string;
  price: string;
  file: File | null;
}

export interface UploadResponse {
  ok: boolean;
  image_cid: string;
  metadata: Record<string, unknown>;
}

export interface BackendConfig {
  marketplaceAddress?: string;
  nftContractAddress?: string;
}
