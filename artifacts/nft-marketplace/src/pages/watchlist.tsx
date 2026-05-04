import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, TrendingUp, TrendingDown, Minus, Trash2 } from "lucide-react";
import { useWatchlist } from "@/context/watchlist";
import { useListNfts, getListNftsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, truncateAddress } from "@/lib/utils";
import { WatchlistButton } from "@/components/watchlist-button";
import { cn } from "@/lib/utils";

function priceChange(saved: string | null, current: string | null | undefined) {
  if (!saved || !current) return null;
  const s = parseFloat(saved);
  const c = parseFloat(current);
  if (isNaN(s) || isNaN(c) || s === 0) return null;
  return ((c - s) / s) * 100;
}

function PriceChangeBadge({ pct }: { pct: number | null }) {
  if (pct === null) return <span className="text-xs text-muted-foreground font-mono">—</span>;
  const up = pct > 0;
  const flat = Math.abs(pct) < 0.01;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-mono font-medium",
        flat && "text-muted-foreground",
        !flat && up && "text-emerald-500",
        !flat && !up && "text-rose-500"
      )}
    >
      {flat ? (
        <Minus className="w-3 h-3" />
      ) : up ? (
        <TrendingUp className="w-3 h-3" />
      ) : (
        <TrendingDown className="w-3 h-3" />
      )}
      {flat ? "No change" : `${up ? "+" : ""}${pct.toFixed(1)}%`}
    </span>
  );
}

export default function Watchlist() {
  const { entries, toggle } = useWatchlist();

  const { data: allNfts, isLoading } = useListNfts(
    {},
    { query: { queryKey: getListNftsQueryKey(), enabled: true } }
  );

  const watchedNfts = entries
    .map((entry) => {
      const nft = allNfts?.find((n) => n.id === entry.nftId);
      return nft ? { nft, entry } : null;
    })
    .filter(Boolean) as { nft: NonNullable<typeof allNfts>[number]; entry: (typeof entries)[number] }[];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
        <div>
          <p className="text-sm text-primary font-medium uppercase tracking-wider mb-2">Saved Items</p>
          <h1 className="font-serif text-4xl md:text-5xl font-medium mb-3">Watchlist</h1>
          <p className="text-muted-foreground">
            Track price movements on NFTs you're interested in.
          </p>
        </div>
        {entries.length > 0 && (
          <p className="text-sm text-muted-foreground font-mono">
            {entries.length} {entries.length === 1 ? "item" : "items"} saved
          </p>
        )}
      </div>

      {entries.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-24 border border-dashed border-border/50 rounded-xl bg-muted/10"
        >
          <div className="w-16 h-16 rounded-full bg-muted border border-border/50 flex items-center justify-center mx-auto mb-6">
            <Heart className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <h2 className="text-xl font-medium mb-2">Nothing saved yet</h2>
          <p className="text-muted-foreground mb-6">
            Hit the heart button on any NFT card to track its price here.
          </p>
          <Link href="/explore">
            <Button variant="outline">Browse the Marketplace</Button>
          </Link>
        </motion.div>
      ) : isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <AnimatePresence initial={false}>
          <div className="flex flex-col gap-3">
            {watchedNfts.map(({ nft, entry }) => {
              const pct = priceChange(entry.savedPrice, nft.price);
              return (
                <motion.div
                  key={nft.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -24, transition: { duration: 0.2 } }}
                  className="flex items-center gap-5 p-5 bg-card border border-border/50 rounded-xl group hover:border-border transition-colors"
                >
                  {/* Image */}
                  <Link href={`/nfts/${nft.id}`}>
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0 border border-border/40">
                      <img
                        src={nft.image}
                        alt={nft.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/nfts/${nft.id}`}>
                      <p className="font-medium truncate hover:text-primary transition-colors">
                        {nft.title}
                      </p>
                    </Link>
                    {nft.collectionName && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{nft.collectionName}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1 font-mono">
                      {truncateAddress(nft.owner)}
                    </p>
                  </div>

                  {/* Saved price */}
                  <div className="hidden sm:block text-right shrink-0">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Saved at</p>
                    <p className="font-mono text-sm">
                      {entry.savedPrice ? `${formatPrice(entry.savedPrice)} ETH` : "—"}
                    </p>
                  </div>

                  {/* Current price */}
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Now</p>
                    <p className="font-mono text-sm font-medium">
                      {nft.price ? `${formatPrice(nft.price)} ETH` : "—"}
                    </p>
                  </div>

                  {/* Change */}
                  <div className="text-right shrink-0 w-20">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Change</p>
                    <PriceChangeBadge pct={pct} />
                  </div>

                  {/* Status badge */}
                  <div className="hidden md:block shrink-0">
                    {nft.isListed ? (
                      <Link href={`/nfts/${nft.id}`}>
                        <Button size="sm" className="h-8 text-xs">
                          Buy Now
                        </Button>
                      </Link>
                    ) : (
                      <span className="text-xs text-muted-foreground border border-border/40 rounded-md px-2.5 py-1.5">
                        Not listed
                      </span>
                    )}
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => toggle(nft.id, nft.price)}
                    className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    aria-label="Remove from watchlist"
                    data-testid={`button-remove-watchlist-${nft.id}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
