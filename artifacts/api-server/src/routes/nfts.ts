import { Router, type IRouter } from "express";
import { eq, asc, desc, and } from "drizzle-orm";
import { db } from "@workspace/db";
import { nftsTable, collectionsTable, activityTable } from "@workspace/db";
import {
  CreateNftBody,
  ListNftForSaleBody,
  BuyNftBody,
  GetNftParams,
  ListNftForSaleParams,
  BuyNftParams,
  ListNftsQueryParams,
} from "@workspace/api-zod";
import crypto from "node:crypto";

const router: IRouter = Router();

function parseId(raw: string | string[]): number {
  const str = Array.isArray(raw) ? raw[0] : raw;
  return parseInt(str, 10);
}

async function enrichNft(nft: typeof nftsTable.$inferSelect) {
  const collection = nft.collectionId
    ? await db
        .select()
        .from(collectionsTable)
        .where(eq(collectionsTable.id, nft.collectionId))
        .then((r) => r[0])
    : null;
  return {
    id: nft.id,
    tokenId: nft.tokenId,
    title: nft.title,
    description: nft.description ?? undefined,
    image: nft.image,
    price: nft.price ?? undefined,
    owner: nft.owner,
    collectionId: nft.collectionId ?? undefined,
    collectionName: collection?.name ?? undefined,
    isListed: nft.isListed,
    royaltyPercent: nft.royaltyPercent,
    createdAt: nft.createdAt.toISOString(),
  };
}

router.get("/nfts", async (req, res): Promise<void> => {
  const parsed = ListNftsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { collectionId, isListed, sort } = parsed.data;

  const conditions = [];
  if (collectionId !== undefined) conditions.push(eq(nftsTable.collectionId, collectionId));
  if (isListed !== undefined) conditions.push(eq(nftsTable.isListed, isListed));

  let query = db
    .select()
    .from(nftsTable)
    .$dynamic();

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  if (sort === "newest") {
    query = query.orderBy(desc(nftsTable.createdAt));
  } else if (sort === "oldest") {
    query = query.orderBy(asc(nftsTable.createdAt));
  } else {
    query = query.orderBy(desc(nftsTable.createdAt));
  }

  const nfts = await query;
  const enriched = await Promise.all(nfts.map(enrichNft));

  res.json(enriched);
});

router.post("/nfts", async (req, res): Promise<void> => {
  const parsed = CreateNftBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { title, description, image, collectionId, owner, royaltyPercent } = parsed.data;
  const tokenId = crypto.randomUUID();

  const [nft] = await db
    .insert(nftsTable)
    .values({
      tokenId,
      title,
      description,
      image,
      collectionId,
      owner,
      royaltyPercent: royaltyPercent ?? 0,
      isListed: false,
    })
    .returning();

  if (collectionId) {
    await db
      .update(collectionsTable)
      .set({ itemCount: db.$count(nftsTable, eq(nftsTable.collectionId, collectionId)) as unknown as number })
      .where(eq(collectionsTable.id, collectionId));
  }

  await db.insert(activityTable).values({
    nftId: nft.id,
    toAddress: owner,
    action: "mint",
  });

  res.status(201).json(await enrichNft(nft));
});

router.get("/nfts/:id", async (req, res): Promise<void> => {
  const params = GetNftParams.safeParse({ id: parseId(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [nft] = await db.select().from(nftsTable).where(eq(nftsTable.id, params.data.id));
  if (!nft) {
    res.status(404).json({ error: "NFT not found" });
    return;
  }

  res.json(await enrichNft(nft));
});

router.patch("/nfts/:id/list", async (req, res): Promise<void> => {
  const params = ListNftForSaleParams.safeParse({ id: parseId(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const bodyParsed = ListNftForSaleBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.message });
    return;
  }

  const [nft] = await db
    .update(nftsTable)
    .set({ isListed: true, price: bodyParsed.data.price })
    .where(eq(nftsTable.id, params.data.id))
    .returning();

  if (!nft) {
    res.status(404).json({ error: "NFT not found" });
    return;
  }

  await db.insert(activityTable).values({
    nftId: nft.id,
    fromAddress: nft.owner,
    price: bodyParsed.data.price,
    action: "list",
  });

  res.json(await enrichNft(nft));
});

router.post("/nfts/:id/buy", async (req, res): Promise<void> => {
  const params = BuyNftParams.safeParse({ id: parseId(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const bodyParsed = BuyNftBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.message });
    return;
  }

  const [existing] = await db.select().from(nftsTable).where(eq(nftsTable.id, params.data.id));
  if (!existing) {
    res.status(404).json({ error: "NFT not found" });
    return;
  }
  if (!existing.isListed) {
    res.status(400).json({ error: "NFT is not listed for sale" });
    return;
  }

  const [nft] = await db
    .update(nftsTable)
    .set({ owner: bodyParsed.data.buyer, isListed: false })
    .where(eq(nftsTable.id, params.data.id))
    .returning();

  await db.insert(activityTable).values({
    nftId: nft.id,
    fromAddress: existing.owner,
    toAddress: bodyParsed.data.buyer,
    price: existing.price ?? undefined,
    action: "sale",
  });

  res.json(await enrichNft(nft));
});

export default router;
