import { Store, Loader2 } from "lucide-react";
import { NFTCard } from "./NFTCard";
import type { NFTListing } from "@/types/nft";

interface ListingsGridProps {
  listings: NFTListing[];
  isLoading: boolean;
  error: string | null;
  onBuy: (listing: NFTListing) => Promise<void>;
}

export const ListingsGrid = ({
  listings,
  isLoading,
  error,
  onBuy,
}: ListingsGridProps) => {
  return (
    <section className="animate-fade-in" style={{ animationDelay: "200ms" }}>
      <div className="flex items-end justify-between gap-4 flex-wrap mb-8">
        <div>
          <p className="text-sm uppercase text-muted-foreground tracking-wide flex items-center gap-2">
            <Store className="w-4 h-4 text-primary" />
            Marketplace Inventory
          </p>
          <h2 className="text-3xl font-display font-semibold text-foreground mt-1">
            Active Listings
          </h2>
        </div>
        <p className="text-muted-foreground text-sm">
          Data source: <code className="text-primary/80">/api/listings</code>
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-16 text-destructive">
          <p>Unable to load listings. Check backend.</p>
          <p className="text-sm text-muted-foreground mt-2">{error}</p>
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Store className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No active listings found.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing, index) => (
            <NFTCard
              key={`${listing.nft_address}-${listing.token_id}`}
              listing={listing}
              onBuy={onBuy}
              index={index}
            />
          ))}
        </div>
      )}
    </section>
  );
};
