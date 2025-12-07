import { useState, useEffect, useCallback } from "react";
import { API_ENDPOINTS } from "@/lib/constants";
import type { NFTListing } from "@/types/nft";

export const useListings = () => {
  const [listings, setListings] = useState<NFTListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(API_ENDPOINTS.listings);
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      const data = await response.json();
      setListings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch listings");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  return { listings, isLoading, error, refetch: fetchListings };
};
