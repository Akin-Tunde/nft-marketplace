import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, ChevronDown, LogOut, ImageIcon, Heart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallet, MOCK_WALLETS } from "@/context/wallet";
import { useWatchlist } from "@/context/watchlist";
import { truncateAddress } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function WalletButton() {
  const { address, label, isConnected, connect, disconnect } = useWallet();
  const { count: watchlistCount } = useWatchlist();
  const [open, setOpen] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  if (!isConnected) {
    return (
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          className="border-primary/40 text-primary hover:bg-primary/10 hover:border-primary gap-2"
          onClick={() => setShowPicker((p) => !p)}
          data-testid="button-connect-wallet"
        >
          <Wallet className="w-4 h-4" />
          Connect Wallet
        </Button>

        <AnimatePresence>
          {showPicker && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowPicker(false)} />
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 z-50 w-72 bg-card border border-border/60 rounded-xl shadow-2xl overflow-hidden"
              >
                <div className="p-4 border-b border-border/50 bg-muted/30">
                  <p className="text-sm font-medium">Select a demo wallet</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    These pre-loaded wallets already own NFTs in the marketplace.
                  </p>
                </div>
                <div className="p-2">
                  {MOCK_WALLETS.map((w) => (
                    <button
                      key={w.address}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors text-left group"
                      onClick={() => {
                        connect(w.address, w.label);
                        setShowPicker(false);
                      }}
                      data-testid={`button-wallet-${w.label.toLowerCase().replace(" ", "-")}`}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                        <Wallet className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium group-hover:text-primary transition-colors">{w.label}</p>
                        <p className="font-mono text-xs text-muted-foreground">{truncateAddress(w.address)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors"
        onClick={() => setOpen((p) => !p)}
        data-testid="button-wallet-menu"
      >
        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary/60 to-primary/20 flex items-center justify-center">
          <Wallet className="w-2.5 h-2.5 text-primary" />
        </div>
        <span className="font-mono text-xs text-primary font-medium">
          {truncateAddress(address!)}
        </span>
        <ChevronDown className={cn("w-3 h-3 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 z-50 w-64 bg-card border border-border/60 rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="p-4 border-b border-border/50 bg-muted/30">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Connected as</p>
                <p className="font-medium text-sm">{label}</p>
                <p className="font-mono text-xs text-muted-foreground mt-0.5">{truncateAddress(address!)}</p>
              </div>
              <div className="p-2">
                <Link href="/my-nfts" onClick={() => setOpen(false)}>
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors text-left" data-testid="link-my-nfts">
                    <ImageIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">My Collection</span>
                  </button>
                </Link>
                <Link href="/watchlist" onClick={() => setOpen(false)}>
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors text-left" data-testid="link-watchlist">
                    <Heart className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Watchlist</span>
                    {watchlistCount > 0 && (
                      <span className="ml-auto text-xs font-mono bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-full px-1.5 py-0.5">
                        {watchlistCount}
                      </span>
                    )}
                  </button>
                </Link>
                <button
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors text-left mt-1"
                  onClick={() => { disconnect(); setOpen(false); }}
                  data-testid="button-disconnect"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Disconnect</span>
                </button>
              </div>

              <div className="border-t border-border/50 p-3 bg-muted/20">
                <p className="text-xs text-muted-foreground mb-2">Switch wallet</p>
                <div className="flex flex-col gap-1">
                  {MOCK_WALLETS.filter((w) => w.address !== address).map((w) => (
                    <button
                      key={w.address}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/50 transition-colors text-left"
                      onClick={() => { connect(w.address, w.label); setOpen(false); }}
                    >
                      <div className="w-4 h-4 rounded-full bg-muted border border-border/50" />
                      <span className="text-xs text-muted-foreground">{w.label}</span>
                      <span className="font-mono text-xs text-muted-foreground/60 ml-auto">{truncateAddress(w.address)}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
