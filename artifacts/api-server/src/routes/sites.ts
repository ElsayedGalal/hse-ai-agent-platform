import { Router } from "express";
import { db } from "@workspace/db";
import { sitesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { GetSiteParams } from "@workspace/api-zod";

const router = Router();

router.get("/sites", async (req, res) => {
  const sites = await db.select().from(sitesTable).orderBy(sitesTable.id);
  res.json(sites);
});

router.get("/sites/:id", async (req, res) => {
  const parsed = GetSiteParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [site] = await db.select().from(sitesTable).where(eq(sitesTable.id, parsed.data.id));
  if (!site) {
    res.status(404).json({ error: "Site not found" });
    return;
  }
  res.json(site);
});

export default router;
