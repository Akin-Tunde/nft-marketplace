import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Collection } from "@workspace/api-client-react";
import { formatPrice, truncateAddress } from "@/lib/utils";
import { ImageIcon } from "lucide-react";

interface CollectionCardProps {
  collection: Collection;
  rank?: number;
}

export function CollectionCard({ collection, rank }: CollectionCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18 }}
      className="group"
      data-testid={`card-collection-${collection.id}`}
    >
      <Link href={`/collections/${collection.id}`}>
        <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card hover:border-primary/30 transition-all duration-250 cursor-pointer hover:shadow-2xl hover:shadow-black/30">
          {/* Image area */}
          <div className="relative aspect-[16/10] overflow-hidden bg-muted/60">
            {collection.coverImage && !imgError ? (
              <img
                src={collection.coverImage}
                alt={collection.name}
                loading="lazy"
                onError={() => setImgError(true)}
                className="object-cover w-full h-full transition-transform duration-600 group-hover:scale-[1.04]"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/80 to-muted/40">
                <ImageIcon className="w-10 h-10 text-muted-foreground/15" />
              </div>
            )}
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />

            {/* Rank badge */}
            {rank !== undefined && (
              <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm border border-border/40 flex items-center justify-center shadow-sm">
                <span className="font-mono text-[11px] font-bold">#{rank}</span>
              </div>
            )}

            {/* Collection name */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3
                className="font-semibold text-base text-white line-clamp-1"
                data-testid={`text-collection-name-${collection.id}`}
              >
                {collection.name}
              </h3>
              <p className="text-[11px] text-white/50 font-mono mt-0.5">
                {truncateAddress(collection.creator)}
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 divide-x divide-border/30 bg-card">
            {[
              { label: "Floor", value: formatPrice(collection.floorPrice) },
              { label: "Volume", value: formatPrice(collection.totalVolume) },
              { label: "Items", value: String(collection.itemCount) },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center py-3 px-2 gap-0.5">
                <span className="font-mono text-xs font-semibold truncate w-full text-center">{s.value}</span>
                <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-medium">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
