import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { shortenAddress } from "@/lib/web3";
import type { NFTListing } from "@/types/nft";

interface NFTCardProps {
  listing: NFTListing;
  onBuy: (listing: NFTListing) => Promise<void>;
  index: number;
}

export const NFTCard = ({ listing, onBuy, index }: NFTCardProps) => {
  const [buyState, setBuyState] = useState<"idle" | "confirming" | "waiting" | "sold">("idle");

  const handleBuy = async () => {
    try {
      setBuyState("confirming");
      await onBuy(listing);
      setBuyState("sold");
    } catch {
      setBuyState("idle");
    }
  };

  const tokenName = listing.name || `Token #${listing.token_id}`;
  const imageUrl =
    listing.image_url || `https://picsum.photos/seed/${listing.token_id}/400/300`;

  const buttonText = {
    idle: "Buy NFT",
    confirming: "Confirm in wallet...",
    waiting: "Waiting for block...",
    sold: "SOLD",
  };

  return (
    <article
      className="card-nft animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div
        className="h-48 rounded-xl bg-cover bg-center bg-secondary relative overflow-hidden group"
        style={{ backgroundImage: `url(${imageUrl})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div>
        <h3 className="text-xl font-display font-semibold text-foreground truncate">
          {tokenName}
        </h3>
        <p className="text-muted-foreground text-sm flex items-center gap-1">
          NFT: {shortenAddress(listing.nft_address)}
          <ExternalLink className="w-3 h-3" />
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Price
          </p>
          <p className="text-2xl font-display font-bold text-primary">
            {listing.price_eth} ETH
          </p>
        </div>
        <button
          onClick={handleBuy}
          disabled={buyState !== "idle"}
          className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
            buyState === "sold"
              ? "bg-secondary text-muted-foreground cursor-not-allowed"
              : "bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          }`}
        >
          {buttonText[buyState]}
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        Seller: {shortenAddress(listing.seller_address)}
      </p>
    </article>
  );
};
