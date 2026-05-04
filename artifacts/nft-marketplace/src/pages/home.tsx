import { useListNfts, useGetMarketplaceStats, useListCollections } from "@workspace/api-client-react";
import { NftCard } from "@/components/nft-card";
import { CollectionCard } from "@/components/collection-card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, TrendingUp, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

const STATS = [
  { key: "volume", label: "Total Volume", suffix: "" },
  { key: "artworks", label: "Artworks", suffix: "" },
  { key: "collections", label: "Collections", suffix: "" },
  { key: "collectors", label: "Collectors", suffix: "" },
];

export default function Home() {
  const { data: stats, isLoading: isLoadingStats } = useGetMarketplaceStats();
  const { data: trendingNfts, isLoading: isLoadingNfts } = useListNfts({ sort: "price_desc" });
  const { data: collections, isLoading: isLoadingCollections } = useListCollections();

  const statValues = [
    isLoadingStats ? null : formatPrice(stats?.totalVolume),
    isLoadingStats ? null : stats?.totalNfts.toLocaleString(),
    isLoadingStats ? null : stats?.totalCollections.toLocaleString(),
    isLoadingStats ? null : stats?.uniqueOwners.toLocaleString(),
  ];

  return (
    <div className="w-full">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-border/40 bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_55%_-10%,hsl(var(--primary)/0.07),transparent)]" />

        <div className="mx-auto max-w-screen-xl px-4 md:px-6 py-16 md:py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16 items-center">
            {/* Left: Copy — 2/5 */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="inline-flex items-center gap-2 mb-5 text-xs font-semibold text-primary bg-primary/8 border border-primary/15 rounded-full px-3 py-1.5"
              >
                <Zap className="w-3 h-3" />
                The NFT Marketplace
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.05 }}
                className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-5 leading-[1.08]"
              >
                Discover &amp; collect{" "}
                <span className="italic font-medium text-primary/75">extraordinary</span>{" "}
                digital art.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.12 }}
                className="text-base text-muted-foreground mb-8 max-w-sm leading-relaxed"
              >
                Mint connects creators and collectors. Buy, sell, and explore unique digital artworks.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.18 }}
                className="flex gap-3"
              >
                <Link href="/explore">
                  <Button size="lg" className="h-11 px-6 font-semibold" data-testid="button-hero-explore">
                    Explore Art
                  </Button>
                </Link>
                <Link href="/create">
                  <Button variant="outline" size="lg" className="h-11 px-6 font-semibold border-border/50 bg-transparent hover:bg-muted/40" data-testid="button-hero-create">
                    Create
                  </Button>
                </Link>
              </motion.div>

              {/* Inline stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="mt-10 flex items-center gap-6 flex-wrap"
              >
                {STATS.slice(0, 3).map((s, i) => (
                  <div key={s.key}>
                    {statValues[i] === null ? (
                      <Skeleton className="h-7 w-16 mb-0.5" />
                    ) : (
                      <p className="font-mono text-lg font-bold" data-testid={`text-stat-${i}`}>{statValues[i]}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">{s.label}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right: Art mosaic — 3/5 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-3 hidden lg:block"
            >
              <div className="grid grid-cols-3 gap-3 relative">
                {/* Big left item */}
                {trendingNfts?.[0] ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.28, duration: 0.5 }}
                    className="col-span-2 row-span-2 aspect-square rounded-2xl overflow-hidden border border-border/40 shadow-2xl group"
                  >
                    <Link href={`/nfts/${trendingNfts[0].id}`}>
                      <div className="relative w-full h-full">
                        <img src={trendingNfts[0].image} alt={trendingNfts[0].title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <p className="font-serif text-lg font-semibold text-white line-clamp-1">{trendingNfts[0].title}</p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-white/60">{trendingNfts[0].collectionName}</p>
                            <p className="font-mono text-sm font-bold text-white">{formatPrice(trendingNfts[0].price)}</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ) : (
                  <Skeleton className="col-span-2 aspect-square rounded-2xl" />
                )}

                {/* Right column: 2 stacked items */}
                {[1, 2].map((i) => (
                  trendingNfts?.[i] ? (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.32 + i * 0.07, duration: 0.5 }}
                      className="aspect-square rounded-2xl overflow-hidden border border-border/40 shadow-lg group"
                    >
                      <Link href={`/nfts/${trendingNfts[i].id}`}>
                        <div className="relative w-full h-full">
                          <img src={trendingNfts[i].image} alt={trendingNfts[i].title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute bottom-2.5 left-2.5 right-2.5">
                            <p className="font-mono text-xs font-bold text-white">{formatPrice(trendingNfts[i].price)}</p>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ) : (
                    <Skeleton key={i} className="aspect-square rounded-2xl" />
                  )
                ))}

                {/* Bottom row: 3 small items */}
                {[3, 4, 5].map((i) => (
                  trendingNfts?.[i] ? (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.38 + (i - 3) * 0.06, duration: 0.4 }}
                      className={cn("aspect-square rounded-xl overflow-hidden border border-border/30 shadow-md group")}
                    >
                      <Link href={`/nfts/${trendingNfts[i].id}`}>
                        <img src={trendingNfts[i].image} alt={trendingNfts[i].title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      </Link>
                    </motion.div>
                  ) : (
                    <Skeleton key={i} className="aspect-square rounded-xl" />
                  )
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Trending NFTs ── */}
      <section className="py-14 md:py-18 border-b border-border/40">
        <div className="mx-auto max-w-screen-xl px-4 md:px-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-primary" />
              </div>
              <div>
                <h2 className="font-serif text-xl md:text-2xl font-semibold">Trending Now</h2>
                <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">Highest-priced artworks in the gallery</p>
              </div>
            </div>
            <Link href="/explore">
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground text-xs">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {isLoadingNfts ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="aspect-square w-full rounded-xl mb-2" />
                  <Skeleton className="h-3.5 w-3/4 mb-1" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {trendingNfts?.slice(0, 6).map((nft, i) => (
                <motion.div
                  key={nft.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                >
                  <NftCard nft={nft} priority={i < 2} rank={i + 1} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Featured Collections ── */}
      <section className="py-14 md:py-18">
        <div className="mx-auto max-w-screen-xl px-4 md:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-serif text-xl md:text-2xl font-semibold">Top Collections</h2>
              <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">By trading volume</p>
            </div>
            <Link href="/collections">
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground text-xs">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {isLoadingCollections ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="aspect-[16/10] w-full rounded-xl mb-2" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {collections?.slice(0, 4).map((collection, i) => (
                <motion.div
                  key={collection.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.07 }}
                >
                  <CollectionCard collection={collection} rank={i + 1} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
