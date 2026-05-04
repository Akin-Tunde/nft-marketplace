import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import { useListNfts, useListCollections } from "@workspace/api-client-react";
import { NftCard } from "@/components/nft-card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal, X, Tag, LayoutGrid, List } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ListNftsSort } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function Explore() {
  const searchStr = useSearch();
  const urlParams = new URLSearchParams(searchStr);
  const urlQ = urlParams.get("q") ?? "";

  const [search, setSearch] = useState(urlQ);
  const [sort, setSort] = useState<ListNftsSort>("newest");
  const [collectionId, setCollectionId] = useState<string>("all");
  const [listedOnly, setListedOnly] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    if (urlQ) setSearch(urlQ);
  }, [urlQ]);

  const { data: nfts, isLoading } = useListNfts({
    sort,
    collectionId: collectionId !== "all" ? Number(collectionId) : undefined,
  });

  const { data: collections } = useListCollections();

  const filtered = nfts?.filter((nft) => {
    const matchSearch =
      !search.trim() ||
      nft.title.toLowerCase().includes(search.toLowerCase()) ||
      nft.owner.toLowerCase().includes(search.toLowerCase());
    const matchListed = !listedOnly || nft.isListed;
    const price = parseFloat(nft.price ?? "0");
    const matchMin = !minPrice || price >= parseFloat(minPrice);
    const matchMax = !maxPrice || price <= parseFloat(maxPrice);
    return matchSearch && matchListed && matchMin && matchMax;
  });

  const clearFilters = () => {
    setSearch("");
    setCollectionId("all");
    setSort("newest");
    setListedOnly(false);
    setMinPrice("");
    setMaxPrice("");
  };

  const hasFilters =
    search !== "" ||
    collectionId !== "all" ||
    sort !== "newest" ||
    listedOnly ||
    minPrice !== "" ||
    maxPrice !== "";

  const activeCollection = collections?.find((c) => c.id.toString() === collectionId);

  return (
    <div className="mx-auto max-w-screen-2xl px-4 md:px-6 py-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-semibold">Explore</h1>
          {!isLoading && (
            <p className="text-sm text-muted-foreground mt-0.5">
              <span className="font-mono font-medium text-foreground">{filtered?.length ?? 0}</span>{" "}
              items
              {activeCollection && (
                <span> in <span className="text-foreground font-medium">{activeCollection.name}</span></span>
              )}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="hidden sm:flex items-center bg-muted/40 rounded-lg p-0.5 border border-border/40">
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

          <Select value={sort} onValueChange={(v) => setSort(v as ListNftsSort)}>
            <SelectTrigger className="w-[160px] h-9 text-sm bg-muted/30 border-border/40 rounded-lg" data-testid="select-sort">
              <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Recently Added</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="price_desc">Price: High → Low</SelectItem>
              <SelectItem value="price_asc">Price: Low → High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-6">
        {/* ── Sidebar ── */}
        <aside className="hidden lg:flex flex-col gap-5 w-56 shrink-0">
          {/* Search */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Search</p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
              <Input
                placeholder="Name or creator..."
                className="pl-9 h-9 text-sm bg-muted/30 border-border/40 rounded-lg"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-testid="input-explore-search"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Status</p>
            <div className="flex flex-col gap-1">
              {[
                { label: "All Items", value: false },
                { label: "Buy Now", value: true },
              ].map((s) => (
                <button
                  key={String(s.value)}
                  onClick={() => setListedOnly(s.value)}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all text-left",
                    listedOnly === s.value
                      ? "bg-primary text-primary-foreground font-medium"
                      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Tag className="w-3.5 h-3.5" />
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Collection */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Collection</p>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setCollectionId("all")}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all text-left",
                  collectionId === "all"
                    ? "bg-muted/70 text-foreground font-medium"
                    : "hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                )}
              >
                All Collections
              </button>
              {collections?.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCollectionId(c.id.toString())}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all text-left truncate",
                    collectionId === c.id.toString()
                      ? "bg-muted/70 text-foreground font-medium"
                      : "hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="truncate">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Price range */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Price Range</p>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Min"
                className="h-9 text-sm bg-muted/30 border-border/40 rounded-lg font-mono"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                min="0"
              />
              <span className="text-muted-foreground/60 text-xs shrink-0">to</span>
              <Input
                type="number"
                placeholder="Max"
                className="h-9 text-sm bg-muted/30 border-border/40 rounded-lg font-mono"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                min="0"
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 text-right">ETH</p>
          </div>

          {hasFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="gap-1.5 text-xs w-full border-border/40"
            >
              <X className="w-3 h-3" />
              Clear all filters
            </Button>
          )}
        </aside>

        {/* ── Main content ── */}
        <div className="flex-1 min-w-0">
          {/* Mobile search + filters */}
          <div className="flex gap-2 mb-4 lg:hidden">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
              <Input
                placeholder="Search..."
                className="pl-9 h-9 text-sm bg-muted/30 border-border/40 rounded-lg"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={collectionId} onValueChange={setCollectionId}>
              <SelectTrigger className="w-[150px] h-9 text-sm bg-muted/30 border-border/40 rounded-lg" data-testid="select-collection">
                <SelectValue placeholder="Collection" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Collections</SelectItem>
                {collections?.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className={cn(
              "grid gap-4",
              viewMode === "grid"
                ? "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1"
            )}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <Skeleton className="aspect-square w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : filtered?.length === 0 ? (
            <div className="text-center py-24 border border-dashed border-border/40 rounded-xl bg-muted/5">
              <p className="text-muted-foreground mb-4">No items match your filters.</p>
              <Button variant="outline" size="sm" onClick={clearFilters}>Clear filters</Button>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={viewMode}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  "grid gap-4",
                  viewMode === "grid"
                    ? "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1 sm:grid-cols-2"
                )}
              >
                {filtered?.map((nft) => (
                  <NftCard key={nft.id} nft={nft} />
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
