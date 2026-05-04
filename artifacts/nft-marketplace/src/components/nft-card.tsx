import { Link } from "wouter";
import { motion } from "framer-motion";
import { Nft } from "@workspace/api-client-react";
import { formatPrice, truncateAddress } from "@/lib/utils";
import { WatchlistButton } from "@/components/watchlist-button";
import { ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

interface NftCardProps {
  nft: Nft;
  priority?: boolean;
  rank?: number;
}

export function NftCard({ nft, priority = false, rank }: NftCardProps) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18 }}
      className="group"
      data-testid={`card-nft-${nft.id}`}
    >
      <Link href={`/nfts/${nft.id}`}>
        <div className="overflow-hidden rounded-xl border border-border/50 bg-card hover:border-primary/30 hover:shadow-2xl hover:shadow-black/30 transition-all duration-250 cursor-pointer flex flex-col">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-muted/60">
            <img
              src={nft.image}
              alt={nft.title}
              loading={priority ? "eager" : "lazy"}
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-[1.06]"
            />

            {/* Rank badge */}
            {rank !== undefined && (
              <div className="absolute top-2.5 left-2.5 w-7 h-7 rounded-full bg-background/85 backdrop-blur-sm border border-border/40 flex items-center justify-center">
                <span className="font-mono text-[10px] font-bold">{rank}</span>
              </div>
            )}

            {/* Watchlist */}
            <div className="absolute top-2.5 right-2.5 transition-all duration-200 opacity-0 group-hover:opacity-100">
              <WatchlistButton nftId={nft.id} price={nft.price} />
            </div>

            {/* Buy Now overlay — appears on hover for listed items */}
            {nft.isListed && (
              <div className="absolute inset-x-0 bottom-0 p-2.5 translate-y-full group-hover:translate-y-0 transition-transform duration-200 ease-out">
                <div
                  className="flex items-center justify-center gap-2 w-full h-9 bg-primary text-primary-foreground text-xs font-semibold rounded-lg shadow-lg"
                  onClick={(e) => e.preventDefault()}
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  Buy Now &nbsp;·&nbsp; {formatPrice(nft.price)}
                </div>
              </div>
            )}

            {/* Bottom scrim for listed badge */}
            {nft.isListed && (
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent pointer-events-none group-hover:opacity-0 transition-opacity" />
            )}
          </div>

          {/* Info */}
          <div className="px-3 pt-3 pb-3 flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3
                  className="font-medium text-sm leading-tight line-clamp-1"
                  data-testid={`text-nft-title-${nft.id}`}
                >
                  {nft.title}
                </h3>
                {nft.collectionName && (
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1 truncate">
                    {nft.collectionName}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/30">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5 font-medium">
                  {nft.isListed ? "Price" : "Last Sale"}
                </p>
                <p
                  className={cn(
                    "font-mono text-sm font-semibold",
                    nft.isListed ? "text-foreground" : "text-muted-foreground"
                  )}
                  data-testid={`text-nft-price-${nft.id}`}
                >
                  {formatPrice(nft.price)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5 font-medium">Owner</p>
                <p className="font-mono text-[11px] text-muted-foreground">{truncateAddress(nft.owner)}</p>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
