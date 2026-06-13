import { Router } from "express";
import { db } from "@workspace/db";
import { recommendationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { ListRecommendationsQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/recommendations", async (req, res) => {
  const parsed = ListRecommendationsQueryParams.safeParse(req.query);
  const siteId = parsed.success ? parsed.data.siteId : undefined;

  const rows = await db
    .select()
    .from(recommendationsTable)
    .where(siteId ? eq(recommendationsTable.siteId, siteId) : undefined)
    .orderBy(recommendationsTable.priority);

  res.json(rows);
});

export default router;
