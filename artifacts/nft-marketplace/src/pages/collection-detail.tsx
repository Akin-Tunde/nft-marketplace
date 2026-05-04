import { useRoute } from "wouter";
import { useGetCollection, getGetCollectionQueryKey } from "@workspace/api-client-react";
import { NftCard } from "@/components/nft-card";
import { formatPrice, truncateAddress } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageIcon } from "lucide-react";

export default function CollectionDetail() {
  const [, params] = useRoute("/collections/:id");
  const collectionId = Number(params?.id);

  const { data: collection, isLoading } = useGetCollection(collectionId, {
    query: {
      enabled: !isNaN(collectionId),
      queryKey: getGetCollectionQueryKey(collectionId)
    }
  });

  if (isLoading) {
    return (
      <div className="w-full">
        <Skeleton className="h-[40vh] w-full rounded-none" />
        <div className="container mx-auto px-4 -mt-24 relative z-10">
          <Skeleton className="w-48 h-48 rounded-xl border-4 border-background mb-6" />
          <Skeleton className="h-10 w-1/3 mb-4" />
          <Skeleton className="h-6 w-2/3 mb-8" />
          <div className="grid grid-cols-4 gap-4 mb-16 max-w-2xl">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20" />)}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col gap-4">
                <Skeleton className="aspect-square w-full rounded-xl" />
                <Skeleton className="h-6 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-medium mb-2">Collection Not Found</h1>
        <p className="text-muted-foreground">The collection you are looking for does not exist.</p>
      </div>
    );
  }

  return (
    <div className="w-full pb-24">
      {/* Cover Image */}
      <div className="relative h-[40vh] w-full bg-muted overflow-hidden flex items-center justify-center">
        {collection.coverImage ? (
          <img 
            src={collection.coverImage} 
            alt={`${collection.name} cover`} 
            className="w-full h-full object-cover opacity-70"
          />
        ) : (
          <ImageIcon className="w-24 h-24 text-muted-foreground/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      </div>

      <div className="container mx-auto px-4 -mt-24 relative z-10">
        {/* Header */}
        <div className="mb-12 max-w-4xl">
          <h1 className="font-serif text-5xl md:text-6xl font-medium mb-4 tracking-tight drop-shadow-md" data-testid="text-collection-title">
            {collection.name}
          </h1>
          <div className="flex items-center gap-2 text-muted-foreground mb-6">
            <span>Created by</span>
            <span className="font-mono text-foreground font-medium">{truncateAddress(collection.creator)}</span>
          </div>
          {collection.description && (
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              {collection.description}
            </p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-card border border-border/50 rounded-xl">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Items</span>
              <span className="font-mono text-xl font-medium">{collection.itemCount}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Created</span>
              <span className="font-mono text-xl font-medium">
                {new Date(collection.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Floor</span>
              <span className="font-mono text-xl font-medium">{formatPrice(collection.floorPrice)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Volume</span>
              <span className="font-mono text-xl font-medium">{formatPrice(collection.totalVolume)}</span>
            </div>
          </div>
        </div>

        {/* NFTs Grid */}
        <div className="mb-8">
          <h2 className="font-serif text-2xl font-medium mb-6">Artworks</h2>
          {collection.nfts.length === 0 ? (
            <div className="text-center py-24 border border-dashed border-border/50 rounded-xl bg-muted/10">
              <p className="text-muted-foreground text-lg">No artworks in this collection yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {collection.nfts.map(nft => (
                <NftCard key={nft.id} nft={nft} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
