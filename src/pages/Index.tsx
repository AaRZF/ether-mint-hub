import { useEffect } from "react";
import { Header } from "@/components/Header";
import { MintForm } from "@/components/MintForm";
import { ListingsGrid } from "@/components/ListingsGrid";
import { useWallet } from "@/hooks/useWallet";
import { useListings } from "@/hooks/useListings";
import { loadBackendConfig, buyNFT } from "@/lib/web3";
import { useToast } from "@/hooks/use-toast";
import type { NFTListing } from "@/types/nft";

const Index = () => {
  const wallet = useWallet();
  const { listings, isLoading, error, refetch } = useListings();
  const { toast } = useToast();

  useEffect(() => {
    loadBackendConfig();
  }, []);

  const handleBuy = async (listing: NFTListing) => {
    if (!wallet.signer) {
      await wallet.connect();
      if (!wallet.signer) return;
    }

    try {
      const txHash = await buyNFT(
        wallet.signer,
        listing.nft_address,
        listing.token_id,
        listing.price_wei
      );
      
      toast({
        title: "Purchase Successful!",
        description: `Tx hash: ${txHash.slice(0, 10)}...`,
      });
      
      refetch();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Transaction rejected";
      toast({
        title: "Transaction Failed",
        description: message,
        variant: "destructive",
      });
      throw err;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        isConnected={wallet.isConnected}
        isConnecting={wallet.isConnecting}
        shortAddress={wallet.shortAddress}
        onConnect={wallet.connect}
      />

      <main className="max-w-5xl mx-auto px-6 py-12 space-y-16">
        <MintForm
          signer={wallet.signer}
          provider={wallet.provider}
          onConnect={wallet.connect}
          onMintSuccess={refetch}
        />

        <ListingsGrid
          listings={listings}
          isLoading={isLoading}
          error={error}
          onBuy={handleBuy}
        />
      </main>
    </div>
  );
};

export default Index;
