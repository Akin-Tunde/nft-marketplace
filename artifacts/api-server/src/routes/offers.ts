import { Router, type IRouter } from "express";
import { eq, and, lt } from "drizzle-orm";
import { db } from "@workspace/db";
import { offersTable, nftsTable, activityTable } from "@workspace/db";
import {
  MakeOfferBody,
  ListNftOffersParams,
  MakeOfferParams,
  AcceptOfferParams,
  DeclineOfferParams,
  ListReceivedOffersQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

const OFFER_TTL_MS = 48 * 60 * 60 * 1000; // 48 hours

function parseId(raw: string | string[]): number {
  const str = Array.isArray(raw) ? raw[0] : raw;
  return parseInt(str, 10);
}

async function enrichOffer(offer: typeof offersTable.$inferSelect) {
  const [nft] = await db.select().from(nftsTable).where(eq(nftsTable.id, offer.nftId));
  return {
    id: offer.id,
    nftId: offer.nftId,
    nftTitle: nft?.title ?? "Unknown",
    nftImage: nft?.image ?? "",
    offererAddress: offer.offererAddress,
    amount: offer.amount,
    status: offer.status,
    createdAt: offer.createdAt.toISOString(),
    expiresAt: offer.expiresAt.toISOString(),
  };
}

/** Sweep any pending offers whose expiresAt has passed and mark them expired. */
async function sweepExpired(nftId?: number) {
  const now = new Date();
  const conditions = nftId
    ? and(eq(offersTable.nftId, nftId), eq(offersTable.status, "pending"), lt(offersTable.expiresAt, now))
    : and(eq(offersTable.status, "pending"), lt(offersTable.expiresAt, now));
  await db.update(offersTable).set({ status: "expired" }).where(conditions!);
}

router.get("/nfts/:id/offers", async (req, res): Promise<void> => {
  const params = ListNftOffersParams.safeParse({ id: parseId(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await sweepExpired(params.data.id);

  const offers = await db
    .select()
    .from(offersTable)
    .where(eq(offersTable.nftId, params.data.id))
    .orderBy(offersTable.createdAt);

  const enriched = await Promise.all(offers.map(enrichOffer));
  res.json(enriched);
});

router.post("/nfts/:id/offers", async (req, res): Promise<void> => {
  const params = MakeOfferParams.safeParse({ id: parseId(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const bodyParsed = MakeOfferBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.message });
    return;
  }

  const [nft] = await db.select().from(nftsTable).where(eq(nftsTable.id, params.data.id));
  if (!nft) {
    res.status(404).json({ error: "NFT not found" });
    return;
  }

  if (nft.owner.toLowerCase() === bodyParsed.data.offererAddress.toLowerCase()) {
    res.status(400).json({ error: "Cannot make an offer on your own NFT" });
    return;
  }

  const expiresAt = new Date(Date.now() + OFFER_TTL_MS);

  const [offer] = await db
    .insert(offersTable)
    .values({
      nftId: params.data.id,
      offererAddress: bodyParsed.data.offererAddress,
      amount: bodyParsed.data.amount,
      status: "pending",
      expiresAt,
    })
    .returning();

  res.status(201).json(await enrichOffer(offer));
});

router.patch("/offers/:id/accept", async (req, res): Promise<void> => {
  const params = AcceptOfferParams.safeParse({ id: parseId(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [offer] = await db.select().from(offersTable).where(eq(offersTable.id, params.data.id));
  if (!offer) {
    res.status(404).json({ error: "Offer not found" });
    return;
  }

  // Auto-expire if past deadline
  if (offer.status === "pending" && offer.expiresAt < new Date()) {
    await db.update(offersTable).set({ status: "expired" }).where(eq(offersTable.id, params.data.id));
    res.status(400).json({ error: "Offer has expired" });
    return;
  }

  if (offer.status !== "pending") {
    res.status(400).json({ error: "Offer is no longer pending" });
    return;
  }

  const [nft] = await db.select().from(nftsTable).where(eq(nftsTable.id, offer.nftId));
  if (!nft) {
    res.status(404).json({ error: "NFT not found" });
    return;
  }

  await db
    .update(nftsTable)
    .set({ owner: offer.offererAddress, isListed: false, price: undefined })
    .where(eq(nftsTable.id, offer.nftId));

  await db.insert(activityTable).values({
    nftId: offer.nftId,
    fromAddress: nft.owner,
    toAddress: offer.offererAddress,
    price: offer.amount,
    action: "sale",
  });

  // Decline all other pending offers for this NFT
  await db
    .update(offersTable)
    .set({ status: "declined" })
    .where(and(eq(offersTable.nftId, offer.nftId), eq(offersTable.status, "pending")));

  const [accepted] = await db
    .update(offersTable)
    .set({ status: "accepted" })
    .where(eq(offersTable.id, params.data.id))
    .returning();

  res.json(await enrichOffer(accepted));
});

router.patch("/offers/:id/decline", async (req, res): Promise<void> => {
  const params = DeclineOfferParams.safeParse({ id: parseId(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [offer] = await db.select().from(offersTable).where(eq(offersTable.id, params.data.id));
  if (!offer) {
    res.status(404).json({ error: "Offer not found" });
    return;
  }
  if (offer.status !== "pending") {
    res.status(400).json({ error: "Offer is no longer pending" });
    return;
  }

  const [declined] = await db
    .update(offersTable)
    .set({ status: "declined" })
    .where(eq(offersTable.id, params.data.id))
    .returning();

  res.json(await enrichOffer(declined));
});

router.get("/offers/received", async (req, res): Promise<void> => {
  const parsed = ListReceivedOffersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  await sweepExpired();

  const ownedNfts = await db
    .select()
    .from(nftsTable)
    .where(eq(nftsTable.owner, parsed.data.ownerAddress));

  if (ownedNfts.length === 0) {
    res.json([]);
    return;
  }

  const nftIds = ownedNfts.map((n) => n.id);
  const allOffers = await db.select().from(offersTable).orderBy(offersTable.createdAt);
  const received = allOffers.filter(
    (o) => nftIds.includes(o.nftId) && o.status === "pending"
  );

  const enriched = await Promise.all(received.map(enrichOffer));
  res.json(enriched);
});

export default router;
