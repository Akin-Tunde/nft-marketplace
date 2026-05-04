import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  useListNfts,
  getListNftsQueryKey,
  useListReceivedOffers,
  getListReceivedOffersQueryKey,
  useAcceptOffer,
  useDeclineOffer,
  getGetNftQueryKey,
} from "@workspace/api-client-react";
import { useWallet } from "@/context/wallet";
import { NftCard } from "@/components/nft-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Wallet, Plus, ImageIcon, Gavel, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import { truncateAddress } from "@/lib/utils";
import { OfferCountdown, OfferExpiryBar } from "@/components/offer-countdown";

type Tab = "artworks" | "offers";

export default function MyNfts() {
  const { address, label, isConnected } = useWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>("artworks");

  const { data: nfts, isLoading: nftsLoading } = useListNfts(
    {},
    { query: { enabled: isConnected, queryKey: getListNftsQueryKey() } }
  );

  const { data: receivedOffers, isLoading: offersLoading } = useListReceivedOffers(
    { ownerAddress: address ?? "" },
    { query: { enabled: isConnected && !!address, queryKey: getListReceivedOffersQueryKey({ ownerAddress: address ?? "" }) } }
  );

  const acceptOffer = useAcceptOffer();
  const declineOffer = useDeclineOffer();

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-muted border border-border/50 flex items-center justify-center mx-auto mb-6">
          <Wallet className="w-8 h-8 text-muted-foreground" />
        </div>
        <h1 className="font-serif text-3xl font-medium mb-3">Connect your wallet</h1>
        <p className="text-muted-foreground mb-8">Connect a wallet to view and manage your NFT collection.</p>
        <p className="text-sm text-muted-foreground">Use the "Connect Wallet" button in the navigation to get started.</p>
      </div>
    );
  }

  const ownedNfts = nfts?.filter((nft) => nft.owner.toLowerCase() === address!.toLowerCase()) ?? [];
  const listedCount = ownedNfts.filter((n) => n.isListed).length;
  const pendingOfferCount = receivedOffers?.length ?? 0;

  const handleAccept = (offerId: number, nftId: number) => {
    acceptOffer.mutate(
      { id: offerId },
      {
        onSuccess: () => {
          toast({ title: "Offer accepted", description: "Ownership has been transferred." });
          queryClient.invalidateQueries({ queryKey: getListNftsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListReceivedOffersQueryKey({ ownerAddress: address! }) });
          queryClient.invalidateQueries({ queryKey: getGetNftQueryKey(nftId) });
        },
        onError: () => {
          toast({ title: "Failed to accept", description: "Please try again.", variant: "destructive" });
        },
      }
    );
  };

  const handleDecline = (offerId: number) => {
    declineOffer.mutate(
      { id: offerId },
      {
        onSuccess: () => {
          toast({ title: "Offer declined" });
          queryClient.invalidateQueries({ queryKey: getListReceivedOffersQueryKey({ ownerAddress: address! }) });
        },
        onError: () => {
          toast({ title: "Failed to decline", description: "Please try again.", variant: "destructive" });
        },
      }
    );
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
        <div>
          <p className="text-sm text-primary font-medium uppercase tracking-wider mb-2">My Collection</p>
          <h1 className="font-serif text-4xl md:text-5xl font-medium mb-3">{label}</h1>
          <p className="font-mono text-sm text-muted-foreground">{address}</p>
        </div>
        <Link href="/create">
          <Button className="gap-2" data-testid="button-mint-new">
            <Plus className="w-4 h-4" />
            Mint New Artwork
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-px bg-border/50 rounded-xl overflow-hidden border border-border/50 mb-10">
        {[
          { label: "Owned", value: nftsLoading ? "—" : ownedNfts.length },
          { label: "Listed", value: nftsLoading ? "—" : listedCount },
          { label: "Unlisted", value: nftsLoading ? "—" : ownedNfts.length - listedCount },
          { label: "Offers In", value: offersLoading ? "—" : pendingOfferCount },
        ].map((stat) => (
          <div key={stat.label} className="bg-card p-6 text-center">
            <p className="font-mono text-3xl font-medium mb-1" data-testid={`stat-${stat.label.toLowerCase().replace(" ", "-")}`}>{stat.value}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted/50 border border-border/50 rounded-xl mb-8 w-fit">
        {[
          { key: "artworks" as Tab, label: "My Artworks", count: ownedNfts.length },
          { key: "offers" as Tab, label: "Offers Received", count: pendingOfferCount },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`relative px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              activeTab === tab.key
                ? "bg-card text-foreground shadow-sm border border-border/50"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`text-xs rounded-full px-1.5 py-0.5 font-mono ${
                activeTab === tab.key ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === "artworks" ? (
          <motion.div
            key="artworks"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {nftsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-4">
                    <Skeleton className="aspect-square w-full rounded-xl" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : ownedNfts.length === 0 ? (
              <div className="text-center py-24 border border-dashed border-border/50 rounded-xl bg-muted/10">
                <ImageIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h2 className="text-xl font-medium mb-2">No artworks yet</h2>
                <p className="text-muted-foreground mb-6">This wallet does not own any NFTs on Mint.</p>
                <Link href="/explore">
                  <Button variant="outline">Browse the Marketplace</Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-medium text-muted-foreground">
                    {ownedNfts.length} {ownedNfts.length === 1 ? "artwork" : "artworks"}
                  </h2>
                </div>
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                  initial="hidden"
                  animate="visible"
                  variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                >
                  {ownedNfts.map((nft) => (
                    <motion.div
                      key={nft.id}
                      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                    >
                      <NftCard nft={nft} />
                    </motion.div>
                  ))}
                </motion.div>
              </>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="offers"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {offersLoading ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-xl" />
                ))}
              </div>
            ) : (receivedOffers?.length ?? 0) === 0 ? (
              <div className="text-center py-24 border border-dashed border-border/50 rounded-xl bg-muted/10">
                <Gavel className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h2 className="text-xl font-medium mb-2">No offers yet</h2>
                <p className="text-muted-foreground">When someone makes an offer on your NFTs, they will appear here.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-medium text-muted-foreground">
                    {receivedOffers!.length} pending {receivedOffers!.length === 1 ? "offer" : "offers"}
                  </h2>
                </div>
                <div className="flex flex-col gap-3">
                  {receivedOffers!.map((offer) => (
                    <motion.div
                      key={offer.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex items-center gap-5 p-5 bg-card border border-border/50 rounded-xl"
                    >
                      {/* NFT Image */}
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0 border border-border/40">
                        <img src={offer.nftImage} alt={offer.nftTitle} className="w-full h-full object-cover" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium truncate">{offer.nftTitle}</p>
                          <Link href={`/nfts/${offer.nftId}`} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                          <span>
                            From{" "}
                            <span className="font-mono">{truncateAddress(offer.offererAddress)}</span>
                          </span>
                          <OfferCountdown expiresAt={offer.expiresAt} />
                        </div>
                        <OfferExpiryBar expiresAt={offer.expiresAt} />
                      </div>

                      {/* Price */}
                      <div className="text-right shrink-0 mr-2">
                        <p className="font-mono text-xl font-medium">{offer.amount}</p>
                        <p className="text-xs text-muted-foreground">ETH</p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleDecline(offer.id)}
                          disabled={declineOffer.isPending}
                          data-testid={`button-decline-${offer.id}`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Decline
                        </Button>
                        <Button
                          size="sm"
                          className="gap-1.5"
                          onClick={() => handleAccept(offer.id, offer.nftId)}
                          disabled={acceptOffer.isPending}
                          data-testid={`button-accept-${offer.id}`}
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Accept
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
