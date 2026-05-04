import { useState } from "react";
import { Link } from "wouter";
import { useListCollections, Collection } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { formatPrice, truncateAddress } from "@/lib/utils";
import { ImageIcon, LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { CollectionCard } from "@/components/collection-card";

function CollectionRow({ collection, rank }: { collection: Collection; rank: number }) {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.04, duration: 0.3 }}
    >
      <Link href={`/collections/${collection.id}`}>
        <div
          className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/20 transition-colors rounded-xl group cursor-pointer"
          data-testid={`card-collection-${collection.id}`}
        >
          {/* Rank */}
          <span className="w-7 text-sm font-mono text-muted-foreground/60 text-center shrink-0">{rank}</span>

          {/* Thumbnail */}
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted border border-border/40 shrink-0">
            {collection.coverImage && !imgError ? (
              <img
                src={collection.coverImage}
                alt={collection.name}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-muted-foreground/20" />
              </div>
            )}
          </div>

          {/* Name & creator */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm group-hover:text-primary transition-colors truncate" data-testid={`text-collection-name-${collection.id}`}>
              {collection.name}
            </p>
            <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{truncateAddress(collection.creator)}</p>
          </div>

          {/* Stats */}
          <div className="hidden sm:grid grid-cols-3 gap-8 text-right shrink-0">
            <div>
              <p className="font-mono text-sm font-semibold">{formatPrice(collection.floorPrice)}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Floor</p>
            </div>
            <div>
              <p className="font-mono text-sm font-semibold">{formatPrice(collection.totalVolume)}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Volume</p>
            </div>
            <div>
              <p className="font-mono text-sm font-semibold">{collection.itemCount}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Items</p>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function Collections() {
  const { data: collections, isLoading } = useListCollections();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <div className="mx-auto max-w-screen-xl px-4 md:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-semibold">Collections</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? "Loading..." : `${collections?.length ?? 0} curated collections`}
          </p>
        </div>

        {/* View toggle */}
        <div className="flex items-center bg-muted/40 rounded-lg p-0.5 border border-border/40">
          {(["grid", "list"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setViewMode(m)}
              className={cn(
                "p-1.5 rounded-md transition-all",
                viewMode === m ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {m === "grid" ? <LayoutGrid className="w-4 h-4" /> : <List className="w-4 h-4" />}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-[16/10] w-full rounded-xl mb-2" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        )
      ) : collections?.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-border/40 rounded-xl bg-muted/5">
          <p className="text-muted-foreground">No collections yet.</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {collections?.map((collection, i) => (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
            >
              <CollectionCard collection={collection} rank={i + 1} />
            </motion.div>
          ))}
        </div>
      ) : (
        /* List / Leaderboard view */
        <div className="bg-card border border-border/40 rounded-2xl overflow-hidden">
          {/* Table header */}
          <div className="flex items-center gap-4 px-5 py-3 border-b border-border/40 bg-muted/20">
            <span className="w-7 shrink-0" />
            <span className="w-12 shrink-0" />
            <span className="flex-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Collection</span>
            <div className="hidden sm:grid grid-cols-3 gap-8 text-right shrink-0 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <span>Floor</span>
              <span>Volume</span>
              <span>Items</span>
            </div>
          </div>
          <div className="divide-y divide-border/30">
            {collections?.map((collection, i) => (
              <CollectionRow key={collection.id} collection={collection} rank={i + 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
