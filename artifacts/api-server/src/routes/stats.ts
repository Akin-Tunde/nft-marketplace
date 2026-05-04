import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { nftsTable, collectionsTable, activityTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/stats", async (_req, res): Promise<void> => {
  const [totalNftsResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(nftsTable);

  const [activeListingsResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(nftsTable)
    .where(eq(nftsTable.isListed, true));

  const [totalCollectionsResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(collectionsTable);

  const [totalSalesResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(activityTable)
    .where(eq(activityTable.action, "sale"));

  const [uniqueOwnersResult] = await db
    .select({ count: sql<number>`count(distinct owner)::int` })
    .from(nftsTable);

  const salesWithPrice = await db
    .select({ price: activityTable.price })
    .from(activityTable)
    .where(eq(activityTable.action, "sale"));

  const totalVolume = salesWithPrice
    .reduce((acc, s) => acc + parseFloat(s.price ?? "0"), 0)
    .toFixed(2);

  res.json({
    totalNfts: totalNftsResult?.count ?? 0,
    activeListings: activeListingsResult?.count ?? 0,
    totalCollections: totalCollectionsResult?.count ?? 0,
    totalVolume,
    totalSales: totalSalesResult?.count ?? 0,
    uniqueOwners: uniqueOwnersResult?.count ?? 0,
  });
});

export default router;
