import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { useWatchlist } from "@/context/watchlist";
import { cn } from "@/lib/utils";

interface WatchlistButtonProps {
  nftId: number;
  price: string | null | undefined;
  className?: string;
}

export function WatchlistButton({ nftId, price, className }: WatchlistButtonProps) {
  const { isWatched, toggle } = useWatchlist();
  const watched = isWatched(nftId);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(nftId, price);
      }}
      className={cn(
        "relative flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200",
        "bg-background/70 backdrop-blur-md border border-border/40",
        watched
          ? "border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20"
          : "hover:bg-background/90 hover:border-border/60",
        className
      )}
      aria-label={watched ? "Remove from watchlist" : "Add to watchlist"}
      data-testid={`button-watchlist-${nftId}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={watched ? "filled" : "empty"}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.15, type: "spring", stiffness: 400, damping: 20 }}
        >
          <Heart
            className={cn(
              "w-4 h-4 transition-colors",
              watched ? "fill-rose-500 text-rose-500" : "text-muted-foreground"
            )}
          />
        </motion.div>
      </AnimatePresence>
    </button>
  );
}
