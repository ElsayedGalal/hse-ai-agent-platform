import { Router } from "express";
import { db } from "@workspace/db";
import { violationsTable, sitesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { StartMonitoringBody } from "@workspace/api-zod";
import { randomUUID } from "crypto";

const VIOLATION_LABELS: Record<string, string> = {
  no_helmet: "عدم ارتداء خوذة السلامة",
  no_vest: "عدم ارتداء السترة العاكسة",
  smoking_danger_zone: "التدخين في منطقة خطر",
  blocked_exit: "انسداد مخرج الطوارئ",
  no_harness: "عدم ارتداء حزام الأمان",
  other: "مخالفة أخرى",
};

const ZONES = ["القطاع الشرقي", "القطاع الغربي", "منطقة التخزين", "ساحة الرافعة الرئيسية", "منطقة الحدادة", "السقالات الخارجية"];
const FINES: Record<string, number> = {
  no_helmet: 3000,
  no_vest: 3000,
  smoking_danger_zone: 5000,
  blocked_exit: 5000,
  no_harness: 4000,
  other: 2000,
};

let ticketCounter = 9900;

const router = Router();

router.post("/monitoring/start", async (req, res) => {
  const parsed = StartMonitoringBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const { siteId, detectionCategories } = parsed.data;

  const categories = detectionCategories && detectionCategories.length > 0
    ? detectionCategories
    : ["no_helmet", "no_vest"];

  const shouldDetect = Math.random() > 0.3;
  const detectedViolations: any[] = [];

  if (shouldDetect) {
    const numViolations = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < numViolations; i++) {
      const violationType = categories[Math.floor(Math.random() * categories.length)] as any;
      const zone = ZONES[Math.floor(Math.random() * ZONES.length)];
      const potentialFineAmount = FINES[violationType] ?? 3000;
      const ticketNumber = `TK-${ticketCounter++}`;

      const [inserted] = await db
        .insert(violationsTable)
        .values({
          siteId,
          ticketNumber,
          violationType,
          zone,
          potentialFineAmount,
          status: "open",
        })
        .returning();

      detectedViolations.push({
        ...inserted,
        violationTypeAr: VIOLATION_LABELS[inserted.violationType] ?? inserted.violationType,
        detectedAt: inserted.detectedAt.toISOString(),
        resolvedAt: null,
      });
    }

    const newComplianceRate = Math.max(50, (await db.select().from(sitesTable).where(eq(sitesTable.id, siteId)))[0]?.complianceRate ?? 74) - 5;
    await db.update(sitesTable).set({ complianceRate: newComplianceRate }).where(eq(sitesTable.id, siteId));
  }

  const [site] = await db.select().from(sitesTable).where(eq(sitesTable.id, siteId));
  const newComplianceRate = site?.complianceRate ?? 74;

  res.json({
    sessionId: randomUUID(),
    siteId,
    detectedViolations,
    newComplianceRate,
    alertSent: detectedViolations.length > 0,
    alertMessage: detectedViolations.length > 0
      ? `تم رصد ${detectedViolations.length} مخالفة سلامة جسيمة في الموقع - تم إرسال تنبيه فوري للمشرف`
      : null,
  });
});

export default router;
