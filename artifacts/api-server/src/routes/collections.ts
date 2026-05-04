import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { collectionsTable, nftsTable } from "@workspace/db";
import {
  CreateCollectionBody,
  GetCollectionParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function parseId(raw: string | string[]): number {
  const str = Array.isArray(raw) ? raw[0] : raw;
  return parseInt(str, 10);
}

function formatCollection(c: typeof collectionsTable.$inferSelect) {
  return {
    id: c.id,
    name: c.name,
    description: c.description ?? undefined,
    creator: c.creator,
    coverImage: c.coverImage ?? undefined,
    floorPrice: c.floorPrice ?? undefined,
    totalVolume: c.totalVolume,
    itemCount: c.itemCount,
    createdAt: c.createdAt.toISOString(),
  };
}

router.get("/collections", async (_req, res): Promise<void> => {
  const collections = await db.select().from(collectionsTable).orderBy(collectionsTable.createdAt);
  res.json(collections.map(formatCollection));
});

router.post("/collections", async (req, res): Promise<void> => {
  const parsed = CreateCollectionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [collection] = await db
    .insert(collectionsTable)
    .values({
      name: parsed.data.name,
      description: parsed.data.description,
      creator: parsed.data.creator,
      coverImage: parsed.data.coverImage,
    })
    .returning();

  res.status(201).json(formatCollection(collection));
});

router.get("/collections/:id", async (req, res): Promise<void> => {
  const params = GetCollectionParams.safeParse({ id: parseId(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [collection] = await db
    .select()
    .from(collectionsTable)
    .where(eq(collectionsTable.id, params.data.id));

  if (!collection) {
    res.status(404).json({ error: "Collection not found" });
    return;
  }

  const nfts = await db
    .select()
    .from(nftsTable)
    .where(eq(nftsTable.collectionId, params.data.id));

  const formattedNfts = nfts.map((nft) => ({
    id: nft.id,
    tokenId: nft.tokenId,
    title: nft.title,
    description: nft.description ?? undefined,
    image: nft.image,
    price: nft.price ?? undefined,
    owner: nft.owner,
    collectionId: nft.collectionId ?? undefined,
    collectionName: collection.name,
    isListed: nft.isListed,
    royaltyPercent: nft.royaltyPercent,
    createdAt: nft.createdAt.toISOString(),
  }));

  res.json({
    ...formatCollection(collection),
    nfts: formattedNfts,
  });
});

export default router;
