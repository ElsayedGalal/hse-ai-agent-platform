import { pgTable, serial, integer, text, real, pgEnum, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const violationTypeEnum = pgEnum("violation_type", [
  "no_helmet",
  "no_vest",
  "smoking_danger_zone",
  "blocked_exit",
  "no_harness",
  "other",
]);

export const violationStatusEnum = pgEnum("violation_status", ["open", "resolved"]);

export const violationsTable = pgTable("violations", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").notNull(),
  ticketNumber: text("ticket_number").notNull(),
  violationType: violationTypeEnum("violation_type").notNull(),
  zone: text("zone").notNull(),
  detectedAt: timestamp("detected_at").notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at"),
  potentialFineAmount: real("potential_fine_amount").notNull().default(3000),
  status: violationStatusEnum("status").notNull().default("open"),
  imageUrl: text("image_url"),
  notes: text("notes"),
});

export const insertViolationSchema = createInsertSchema(violationsTable).omit({ id: true, detectedAt: true, resolvedAt: true });
export type InsertViolation = z.infer<typeof insertViolationSchema>;
export type Violation = typeof violationsTable.$inferSelect;
