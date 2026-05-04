import { useState } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGetNft,
  getGetNftQueryKey,
  useBuyNft,
  useListNftForSale,
  useMakeOffer,
  getListNftsQueryKey,
  getListNftOffersQueryKey,
  useListNftOffers,
} from "@workspace/api-client-react";
import { formatPrice, truncateAddress } from "@/lib/utils";
import { useWallet } from "@/context/wallet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Tag, ShieldCheck, CheckCircle, Wallet, Gavel, Clock } from "lucide-react";
import { OfferCountdown } from "@/components/offer-countdown";

export default function NftDetail() {
  const [, params] = useRoute("/nfts/:id");
  const [, setLocation] = useLocation();
  const nftId = Number(params?.id);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { address, isConnected } = useWallet();

  const [isBuyOpen, setIsBuyOpen] = useState(false);
  const [buyerAddress, setBuyerAddress] = useState("");
  const [isListOpen, setIsListOpen] = useState(false);
  const [listPrice, setListPrice] = useState("");
  const [isOfferOpen, setIsOfferOpen] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const [purchaseConfirmed, setPurchaseConfirmed] = useState(false);
  const [offerConfirmed, setOfferConfirmed] = useState(false);

  const { data: nft, isLoading } = useGetNft(nftId, {
    query: { enabled: !isNaN(nftId), queryKey: getGetNftQueryKey(nftId) },
  });

  const { data: offers } = useListNftOffers(nftId, {
    query: {
      enabled: !isNaN(nftId),
      queryKey: getListNftOffersQueryKey(nftId),
    },
  });

  const buyNft = useBuyNft();
  const listNft = useListNftForSale();
  const makeOffer = useMakeOffer();

  const isOwner =
    isConnected && nft?.owner.toLowerCase() === address?.toLowerCase();

  const pendingOffers = offers?.filter((o) => o.status === "pending") ?? [];
  const myOffer = isConnected
    ? pendingOffers.find((o) => o.offererAddress.toLowerCase() === address!.toLowerCase())
    : undefined;

  const handleOpenBuy = () => {
    setBuyerAddress(isConnected ? address! : "");
    setIsBuyOpen(true);
  };

  const handleBuy = () => {
    const buyer = isConnected ? address! : buyerAddress;
    if (!buyer) {
      toast({ title: "No wallet address", description: "Please connect a wallet or enter a buyer address.", variant: "destructive" });
      return;
    }
    buyNft.mutate(
      { id: nftId, data: { buyer } },
      {
        onSuccess: () => {
          setIsBuyOpen(false);
          setPurchaseConfirmed(true);
          queryClient.invalidateQueries({ queryKey: getGetNftQueryKey(nftId) });
          queryClient.invalidateQueries({ queryKey: getListNftsQueryKey() });
        },
        onError: () => {
          toast({ title: "Purchase failed", description: "This artwork could not be purchased. Please try again.", variant: "destructive" });
        },
      }
    );
  };

  const handleList = () => {
    if (!listPrice || isNaN(Number(listPrice)) || Number(listPrice) <= 0) {
      toast({ title: "Invalid price", description: "Please enter a valid ETH price greater than 0.", variant: "destructive" });
      return;
    }
    listNft.mutate(
      { id: nftId, data: { price: listPrice } },
      {
        onSuccess: () => {
          setIsListOpen(false);
          setListPrice("");
          toast({ title: "Listed for sale", description: "Your artwork is now listed on the marketplace." });
          queryClient.invalidateQueries({ queryKey: getGetNftQueryKey(nftId) });
          queryClient.invalidateQueries({ queryKey: getListNftsQueryKey() });
        },
        onError: () => {
          toast({ title: "Listing failed", description: "Could not list this artwork. Please try again.", variant: "destructive" });
        },
      }
    );
  };

  const handleMakeOffer = () => {
    if (!offerAmount || isNaN(Number(offerAmount)) || Number(offerAmount) <= 0) {
      toast({ title: "Invalid amount", description: "Please enter a valid ETH amount greater than 0.", variant: "destructive" });
      return;
    }
    if (!isConnected) {
      toast({ title: "Wallet required", description: "Connect a wallet to make an offer.", variant: "destructive" });
      return;
    }
    makeOffer.mutate(
      { id: nftId, data: { offererAddress: address!, amount: offerAmount } },
      {
        onSuccess: () => {
          setIsOfferOpen(false);
          setOfferAmount("");
          setOfferConfirmed(true);
          queryClient.invalidateQueries({ queryKey: getListNftOffersQueryKey(nftId) });
        },
        onError: () => {
          toast({ title: "Offer failed", description: "Could not submit your offer. Please try again.", variant: "destructive" });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Skeleton className="aspect-square w-full rounded-none" />
          <div className="flex flex-col gap-6 pt-8">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <div className="border border-border/50 rounded-xl p-6 mt-8">
              <Skeleton className="h-16 w-full" />
            </div>
            <Skeleton className="h-32 w-full mt-8" />
          </div>
        </div>
      </div>
    );
  }

  if (!nft) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-medium mb-2">Artwork Not Found</h1>
        <p className="text-muted-foreground">The piece you are looking for does not exist.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        {/* Left Col: Image */}
        <div className="flex flex-col gap-6">
          <div className="relative aspect-square w-full bg-muted border border-border/50 rounded-xl overflow-hidden group">
            <img
              src={nft.image}
              alt={nft.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            />
            {nft.isListed && (
              <div className="absolute top-4 right-4">
                <Badge
                  variant="secondary"
                  className="bg-background/80 backdrop-blur-md text-foreground px-3 py-1 text-sm border-none"
                >
                  For Sale
                </Badge>
              </div>
            )}
          </div>

          <div className="hidden lg:block border border-border/50 rounded-xl overflow-hidden bg-card">
            <div className="border-b border-border/50 p-4 bg-muted/30 flex items-center gap-2 font-medium">
              <Tag className="w-4 h-4 text-muted-foreground" /> Properties
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              <div className="bg-muted/30 p-3 rounded-lg border border-border/40 text-center">
                <div className="text-xs text-primary uppercase tracking-wider mb-1">Token ID</div>
                <div className="font-mono text-xs font-medium truncate">{nft.tokenId.slice(0, 16)}…</div>
              </div>
              <div className="bg-muted/30 p-3 rounded-lg border border-border/40 text-center">
                <div className="text-xs text-primary uppercase tracking-wider mb-1">Royalty</div>
                <div className="font-mono font-medium">{nft.royaltyPercent}%</div>
              </div>
            </div>
          </div>

          {/* Offers panel — visible on desktop left col for non-owners */}
          {!isOwner && pendingOffers.length > 0 && (
            <div className="hidden lg:block border border-border/50 rounded-xl overflow-hidden bg-card">
              <div className="border-b border-border/50 p-4 bg-muted/30 flex items-center gap-2 font-medium">
                <Gavel className="w-4 h-4 text-muted-foreground" />
                <span>Offers</span>
                <span className="ml-auto text-xs text-muted-foreground">{pendingOffers.length} pending</span>
              </div>
              <div className="divide-y divide-border/40">
                {pendingOffers.slice(0, 5).map((offer) => (
                  <div key={offer.id} className="p-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-4">
                      <div className="font-mono text-sm text-muted-foreground truncate">{truncateAddress(offer.offererAddress)}</div>
                      <div className="font-mono font-medium text-sm shrink-0">{offer.amount} ETH</div>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <OfferCountdown expiresAt={offer.expiresAt} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Details */}
        <div className="flex flex-col pt-2 lg:pt-8">
          {nft.collectionName && (
            <Link
              href={`/collections/${nft.collectionId}`}
              className="text-primary hover:text-primary/80 font-medium mb-2 flex items-center gap-2 w-fit transition-colors"
              data-testid="link-collection"
            >
              {nft.collectionName}
            </Link>
          )}

          <h1
            className="font-serif text-4xl md:text-5xl font-medium tracking-tight mb-6 leading-tight"
            data-testid="text-nft-title"
          >
            {nft.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-sm mb-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-muted overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-primary/40 to-primary/10" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wider">
                  {isOwner ? "Owned by you" : "Owned by"}
                </p>
                <p className="font-mono font-medium">
                  {isOwner ? (
                    <span className="text-primary">{truncateAddress(nft.owner)}</span>
                  ) : (
                    truncateAddress(nft.owner)
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="border border-border/50 rounded-xl bg-card overflow-hidden mb-6">
            <div className="p-6">
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
                Current Price
              </p>
              <div className="flex items-end gap-4 mb-6">
                <span
                  className="font-mono text-4xl font-medium tracking-tight"
                  data-testid="text-nft-price"
                >
                  {formatPrice(nft.price)}
                </span>
                <span className="text-muted-foreground mb-1">ETH</span>
              </div>

              <div className="flex gap-3">
                {isOwner ? (
                  nft.isListed ? (
                    <Button size="lg" variant="outline" className="flex-1 h-14 text-base border-muted-foreground/30 text-muted-foreground cursor-default" disabled>
                      Listed — your artwork
                    </Button>
                  ) : (
                    <Button size="lg" variant="secondary" className="flex-1 h-14 text-base" onClick={() => setIsListOpen(true)} data-testid="button-list">
                      List for Sale
                    </Button>
                  )
                ) : nft.isListed ? (
                  <Button size="lg" className="flex-1 h-14 text-base" onClick={handleOpenBuy} data-testid="button-buy">
                    Buy Now
                  </Button>
                ) : (
                  <>
                    <Button size="lg" variant="outline" className="flex-1 h-14 text-base border-muted-foreground/30 text-muted-foreground cursor-default" disabled>
                      Not for sale
                    </Button>
                    {isConnected && !myOffer && (
                      <Button size="lg" variant="secondary" className="h-14 px-6 text-base gap-2" onClick={() => setIsOfferOpen(true)} data-testid="button-make-offer">
                        <Gavel className="w-4 h-4" />
                        Make Offer
                      </Button>
                    )}
                  </>
                )}

                {/* Make offer also available on listed NFTs you don't own */}
                {!isOwner && nft.isListed && isConnected && !myOffer && (
                  <Button size="lg" variant="outline" className="h-14 px-5 text-base gap-2 border-border/50" onClick={() => setIsOfferOpen(true)} data-testid="button-make-offer-listed">
                    <Gavel className="w-4 h-4" />
                    Offer
                  </Button>
                )}
              </div>

              {/* My pending offer badge */}
              {myOffer && (
                <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <Clock className="w-4 h-4 text-primary shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Your offer of{" "}
                    <span className="font-mono font-medium text-foreground">{myOffer.amount} ETH</span>{" "}
                    is pending.
                  </p>
                </div>
              )}

              {!isConnected && nft.isListed && !isOwner && (
                <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
                  <Wallet className="w-3 h-3" />
                  Connect a wallet to purchase with one click.
                </p>
              )}
            </div>
          </div>

          <div className="border border-border/50 rounded-xl overflow-hidden bg-card mb-6">
            <div className="border-b border-border/50 p-4 bg-muted/30 flex items-center gap-2 font-medium">
              <ShieldCheck className="w-4 h-4 text-muted-foreground" /> Description
            </div>
            <div className="p-6 text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {nft.description || "No description provided for this artwork."}
            </div>
          </div>

          <div className="lg:hidden border border-border/50 rounded-xl overflow-hidden bg-card">
            <div className="border-b border-border/50 p-4 bg-muted/30 flex items-center gap-2 font-medium">
              <Tag className="w-4 h-4 text-muted-foreground" /> Properties
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              <div className="bg-muted/30 p-3 rounded-lg border border-border/40 text-center">
                <div className="text-xs text-primary uppercase tracking-wider mb-1">Token ID</div>
                <div className="font-mono text-xs font-medium truncate">{nft.tokenId.slice(0, 16)}…</div>
              </div>
              <div className="bg-muted/30 p-3 rounded-lg border border-border/40 text-center">
                <div className="text-xs text-primary uppercase tracking-wider mb-1">Royalty</div>
                <div className="font-mono font-medium">{nft.royaltyPercent}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Buy Dialog */}
      <Dialog open={isBuyOpen} onOpenChange={setIsBuyOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Complete Purchase</DialogTitle>
            <DialogDescription>
              You are about to purchase{" "}
              <span className="font-medium text-foreground">{nft.title}</span> for{" "}
              <span className="font-mono font-medium text-foreground">{formatPrice(nft.price)} ETH</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {isConnected ? (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Wallet className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground mb-0.5">Purchasing as</p>
                  <p className="font-mono text-sm font-medium text-primary truncate">{address}</p>
                </div>
              </div>
            ) : (
              <>
                <label htmlFor="buyer-address" className="text-sm font-medium mb-2 block">Your Wallet Address</label>
                <Input id="buyer-address" placeholder="0x..." value={buyerAddress} onChange={(e) => setBuyerAddress(e.target.value)} className="bg-muted/50 font-mono" data-testid="input-buyer-address" />
                <p className="text-xs text-muted-foreground mt-2">Connect a wallet in the nav bar to purchase with one click.</p>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBuyOpen(false)}>Cancel</Button>
            <Button onClick={handleBuy} disabled={buyNft.isPending} data-testid="button-confirm-purchase">
              {buyNft.isPending ? "Confirming..." : "Confirm Purchase"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* List Dialog */}
      <Dialog open={isListOpen} onOpenChange={setIsListOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>List for Sale</DialogTitle>
            <DialogDescription>
              Set a price to list <span className="font-medium text-foreground">{nft.title}</span> on the marketplace.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label htmlFor="list-price" className="text-sm font-medium mb-2 block">Price (ETH)</label>
            <Input id="list-price" type="number" step="0.01" min="0" placeholder="0.00" value={listPrice} onChange={(e) => setListPrice(e.target.value)} className="bg-muted/50" data-testid="input-list-price" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsListOpen(false)}>Cancel</Button>
            <Button onClick={handleList} disabled={listNft.isPending} data-testid="button-confirm-list">
              {listNft.isPending ? "Listing..." : "Complete Listing"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Make Offer Dialog */}
      <Dialog open={isOfferOpen} onOpenChange={setIsOfferOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Make an Offer</DialogTitle>
            <DialogDescription>
              Propose a price for{" "}
              <span className="font-medium text-foreground">{nft.title}</span>. The owner will
              receive your offer and can accept or decline.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 flex flex-col gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border/50">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Wallet className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground mb-0.5">Offering from</p>
                <p className="font-mono text-sm font-medium truncate">{address}</p>
              </div>
            </div>
            <div>
              <label htmlFor="offer-amount" className="text-sm font-medium mb-2 block">
                Your Offer (ETH)
              </label>
              <Input
                id="offer-amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                className="bg-muted/50"
                data-testid="input-offer-amount"
                autoFocus
              />
              {nft.price && (
                <p className="text-xs text-muted-foreground mt-2">
                  Last price: <span className="font-mono">{formatPrice(nft.price)} ETH</span>
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOfferOpen(false)}>Cancel</Button>
            <Button onClick={handleMakeOffer} disabled={makeOffer.isPending} data-testid="button-confirm-offer">
              {makeOffer.isPending ? "Submitting..." : "Submit Offer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Purchase Confirmation Overlay */}
      <AnimatePresence>
        {purchaseConfirmed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm"
            onClick={() => setPurchaseConfirmed(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              className="bg-card border border-border/60 rounded-2xl p-10 max-w-sm w-full mx-4 text-center shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 400, damping: 20 }}
                className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="w-10 h-10 text-primary" />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <h2 className="font-serif text-2xl font-medium mb-2">Purchase Confirmed</h2>
                <p className="text-muted-foreground mb-2">
                  You now own <span className="font-medium text-foreground">{nft.title}</span>.
                </p>
                {isConnected && (
                  <p className="text-xs text-muted-foreground font-mono mb-6">{truncateAddress(address!)}</p>
                )}
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" size="sm" onClick={() => setPurchaseConfirmed(false)}>Stay here</Button>
                  <Button size="sm" onClick={() => { setPurchaseConfirmed(false); setLocation("/my-nfts"); }} data-testid="button-view-collection">
                    View My Collection
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offer Submitted Overlay */}
      <AnimatePresence>
        {offerConfirmed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm"
            onClick={() => setOfferConfirmed(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              className="bg-card border border-border/60 rounded-2xl p-10 max-w-sm w-full mx-4 text-center shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 400, damping: 20 }}
                className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6"
              >
                <Gavel className="w-10 h-10 text-primary" />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <h2 className="font-serif text-2xl font-medium mb-2">Offer Submitted</h2>
                <p className="text-muted-foreground mb-6">
                  Your offer is now pending. The owner will be notified and can accept or decline.
                </p>
                <Button size="sm" onClick={() => setOfferConfirmed(false)} data-testid="button-close-offer-confirm">
                  Done
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
