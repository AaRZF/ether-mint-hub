import { useState, useRef, FormEvent } from "react";
import { Upload, ImagePlus, Sparkles } from "lucide-react";
import { API_ENDPOINTS } from "@/lib/constants";
import { loadBackendConfig, mintAndListNFT, triggerReindex } from "@/lib/web3";
import { useToast } from "@/hooks/use-toast";
import type { JsonRpcSigner, BrowserProvider } from "ethers";
import type { UploadResponse } from "@/types/nft";

interface MintFormProps {
  signer: JsonRpcSigner | null;
  provider: BrowserProvider | null;
  onConnect: () => Promise<void>;
  onMintSuccess: () => void;
}

export const MintForm = ({
  signer,
  provider,
  onConnect,
  onMintSuccess,
}: MintFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ message: string; type: "info" | "success" | "error" } | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileName(file?.name || null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const file = formData.get("file") as File;

    if (!file || file.size === 0) {
      setStatus({ message: "Please choose an image file to upload.", type: "error" });
      return;
    }

    try {
      if (!signer) {
        await onConnect();
        if (!signer) {
          setStatus({ message: "Wallet connection required.", type: "error" });
          return;
        }
      }

      await loadBackendConfig();

      setIsSubmitting(true);
      setStatus({ message: "Uploading artwork to NFT.Storage...", type: "info" });

      const response = await fetch(API_ENDPOINTS.upload, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || `Upload failed (${response.status})`);
      }

      const result: UploadResponse = await response.json();
      if (!result?.ok) {
        throw new Error("Unexpected response from backend");
      }

      const tokenURI = `ipfs://${result.image_cid}`;
      const priceEth = parseFloat(formData.get("price") as string);
      
      if (!(priceEth > 0)) {
        throw new Error("Enter a valid positive price");
      }

      const tokenId = await mintAndListNFT(
        signer!,
        provider!,
        tokenURI,
        priceEth,
        (msg) => setStatus({ message: msg, type: "info" })
      );

      setStatus({ message: "Listing created. Refreshing inventory...", type: "info" });
      await triggerReindex();
      onMintSuccess();

      toast({
        title: "NFT Listed Successfully!",
        description: `Token #${tokenId} listed at ${priceEth} ETH`,
      });

      setStatus({
        message: `Success! Minted tokenId: ${tokenId} and listed at ${priceEth} ETH.`,
        type: "success",
      });
      
      formRef.current?.reset();
      setFileName(null);
    } catch (error) {
      console.error("Mint+List failed", error);
      setStatus({
        message: error instanceof Error ? error.message : "Operation failed. See console.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="section-glass animate-fade-in">
      <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
        <div>
          <p className="text-sm uppercase text-muted-foreground tracking-wide flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Creator Panel
          </p>
          <h2 className="text-3xl font-display font-semibold text-foreground mt-1">
            Mint a New NFT
          </h2>
        </div>
        <p className="text-muted-foreground text-sm max-w-sm">
          Upload your artwork and metadata. The backend stores it on NFT.Storage via{" "}
          <code className="text-primary/80">/api/nft/upload</code>.
        </p>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="mintName" className="block text-sm font-medium text-foreground/80 mb-2">
            Name
          </label>
          <input
            id="mintName"
            name="name"
            type="text"
            required
            className="input-field"
            placeholder="e.g. Celestial Tiger #1"
          />
        </div>

        <div>
          <label htmlFor="mintDescription" className="block text-sm font-medium text-foreground/80 mb-2">
            Description
          </label>
          <textarea
            id="mintDescription"
            name="description"
            rows={3}
            className="input-field resize-none"
            placeholder="Optional story for this NFT"
          />
        </div>

        <div>
          <label htmlFor="mintPrice" className="block text-sm font-medium text-foreground/80 mb-2">
            Price (ETH)
          </label>
          <input
            id="mintPrice"
            name="price"
            type="number"
            step="0.000000000000000001"
            min="0"
            required
            className="input-field"
            placeholder="e.g. 0.1"
          />
        </div>

        <div>
          <label htmlFor="mintImage" className="block text-sm font-medium text-foreground/80 mb-2">
            Artwork
          </label>
          <label
            htmlFor="mintImage"
            className="flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-border 
                       bg-surface-glass hover:border-primary/50 hover:bg-surface-elevated transition-all duration-200 cursor-pointer"
          >
            {fileName ? (
              <div className="flex items-center gap-2 text-primary">
                <ImagePlus className="w-6 h-6" />
                <span className="font-medium">{fileName}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center text-muted-foreground">
                <Upload className="w-8 h-8 mb-2" />
                <span className="text-sm">Click to upload artwork</span>
              </div>
            )}
          </label>
          <input
            id="mintImage"
            name="file"
            type="file"
            accept="image/*"
            required
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full sm:w-auto"
        >
          {isSubmitting ? "Processing..." : "Upload & Prepare Metadata"}
        </button>
      </form>

      {status && (
        <div
          className={`mt-6 p-4 rounded-xl text-sm ${
            status.type === "success"
              ? "bg-primary/10 text-primary border border-primary/20"
              : status.type === "error"
              ? "bg-destructive/10 text-destructive border border-destructive/20"
              : "bg-secondary text-muted-foreground border border-border"
          }`}
        >
          {status.message}
        </div>
      )}
    </section>
  );
};
