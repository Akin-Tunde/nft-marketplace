import { Router, type IRouter } from "express";
import { desc } from "drizzle-orm";
import { db } from "@workspace/db";
import { activityTable, nftsTable } from "@workspace/db";
import { ListActivityQueryParams } from "@workspace/api-zod";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/activity", async (req, res): Promise<void> => {
  const parsed = ListActivityQueryParams.safeParse(req.query);
  const limit = parsed.success ? (parsed.data.limit ?? 20) : 20;

  const events = await db
    .select()
    .from(activityTable)
    .orderBy(desc(activityTable.createdAt))
    .limit(limit);

  const enriched = await Promise.all(
    events.map(async (e) => {
      const [nft] = await db.select().from(nftsTable).where(eq(nftsTable.id, e.nftId));
      return {
        id: e.id,
        nftId: e.nftId,
        nftTitle: nft?.title ?? "Unknown",
        nftImage: nft?.image ?? "",
        fromAddress: e.fromAddress ?? undefined,
        toAddress: e.toAddress ?? undefined,
        price: e.price ?? undefined,
        action: e.action,
        createdAt: e.createdAt.toISOString(),
      };
    })
  );

  res.json(enriched);
});

export default router;
