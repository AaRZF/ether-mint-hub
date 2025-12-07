import { Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  isConnected: boolean;
  isConnecting: boolean;
  shortAddress: string | null;
  onConnect: () => void;
}

export const Header = ({
  isConnected,
  isConnecting,
  shortAddress,
  onConnect,
}: HeaderProps) => {
  return (
    <header className="glass border-b border-border/50">
      <div className="max-w-5xl mx-auto px-6 py-6 flex flex-wrap gap-4 items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">FastAPI + Web3 Demo</p>
          <h1 className="text-2xl font-display font-semibold text-foreground">
            Python NFT Marketplace
          </h1>
        </div>
        <button
          onClick={onConnect}
          disabled={isConnecting}
          className={cn(
            "btn-wallet flex items-center gap-2",
            isConnected ? "btn-wallet-connected" : "btn-wallet-disconnected"
          )}
        >
          <Wallet className="w-4 h-4" />
          {isConnecting
            ? "Connecting..."
            : isConnected
            ? shortAddress
            : "Connect Wallet"}
        </button>
      </div>
    </header>
  );
};
