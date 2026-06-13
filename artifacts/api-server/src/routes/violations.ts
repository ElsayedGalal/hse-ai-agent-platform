import { Router } from "express";
import { db } from "@workspace/db";
import { violationsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import {
  ListViolationsQueryParams,
  CreateViolationBody,
  GetViolationParams,
  UpdateViolationParams,
  UpdateViolationBody,
} from "@workspace/api-zod";

const VIOLATION_LABELS: Record<string, string> = {
  no_helmet: "عدم ارتداء خوذة السلامة",
  no_vest: "عدم ارتداء السترة العاكسة",
  smoking_danger_zone: "التدخين في منطقة خطر",
  blocked_exit: "انسداد مخرج الطوارئ",
  no_harness: "عدم ارتداء حزام الأمان",
  other: "مخالفة أخرى",
};

let ticketCounter = 9824;

const router = Router();

router.get("/violations", async (req, res) => {
  const parsed = ListViolationsQueryParams.safeParse(req.query);
  const params = parsed.success ? parsed.data : {};

  const conditions = [];
  if (params.siteId) conditions.push(eq(violationsTable.siteId, params.siteId));
  if (params.status && params.status !== "all") {
    conditions.push(eq(violationsTable.status, params.status as "open" | "resolved"));
  }

  const rows = await db
    .select()
    .from(violationsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(violationsTable.detectedAt));

  const result = rows.map((v) => ({
    ...v,
    violationTypeAr: VIOLATION_LABELS[v.violationType] ?? v.violationType,
    detectedAt: v.detectedAt.toISOString(),
    resolvedAt: v.resolvedAt ? v.resolvedAt.toISOString() : null,
  }));
  res.json(result);
});

router.post("/violations", async (req, res) => {
  const parsed = CreateViolationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const ticketNumber = `TK-${ticketCounter++}`;
  const [inserted] = await db
    .insert(violationsTable)
    .values({
      ...parsed.data,
      ticketNumber,
    })
    .returning();
  res.status(201).json({
    ...inserted,
    violationTypeAr: VIOLATION_LABELS[inserted.violationType] ?? inserted.violationType,
    detectedAt: inserted.detectedAt.toISOString(),
    resolvedAt: inserted.resolvedAt ? inserted.resolvedAt.toISOString() : null,
  });
});

router.get("/violations/:id", async (req, res) => {
  const parsed = GetViolationParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [row] = await db.select().from(violationsTable).where(eq(violationsTable.id, parsed.data.id));
  if (!row) {
    res.status(404).json({ error: "Violation not found" });
    return;
  }
  res.json({
    ...row,
    violationTypeAr: VIOLATION_LABELS[row.violationType] ?? row.violationType,
    detectedAt: row.detectedAt.toISOString(),
    resolvedAt: row.resolvedAt ? row.resolvedAt.toISOString() : null,
  });
});

router.patch("/violations/:id", async (req, res) => {
  const paramsParsed = UpdateViolationParams.safeParse({ id: Number(req.params.id) });
  if (!paramsParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const bodyParsed = UpdateViolationBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const updateData: Partial<typeof violationsTable.$inferInsert> = {};
  if (bodyParsed.data.status) updateData.status = bodyParsed.data.status as "open" | "resolved";
  if (bodyParsed.data.notes) updateData.notes = bodyParsed.data.notes;
  if (bodyParsed.data.status === "resolved") {
    updateData.resolvedAt = new Date();
  }

  const [updated] = await db
    .update(violationsTable)
    .set(updateData)
    .where(eq(violationsTable.id, paramsParsed.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Violation not found" });
    return;
  }

  res.json({
    ...updated,
    violationTypeAr: VIOLATION_LABELS[updated.violationType] ?? updated.violationType,
    detectedAt: updated.detectedAt.toISOString(),
    resolvedAt: updated.resolvedAt ? updated.resolvedAt.toISOString() : null,
  });
});

export default router;
