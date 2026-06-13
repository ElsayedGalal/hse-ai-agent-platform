import { pgTable, serial, text, real, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const siteStatusEnum = pgEnum("site_status", ["active", "paused", "offline"]);

export const sitesTable = pgTable("sites", {
  id: serial("id").primaryKey(),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en"),
  location: text("location").notNull(),
  complianceRate: real("compliance_rate").notNull().default(75),
  status: siteStatusEnum("status").notNull().default("active"),
  cameraCount: integer("camera_count").notNull().default(0),
  lastInspection: text("last_inspection"),
});

export const insertSiteSchema = createInsertSchema(sitesTable).omit({ id: true });
export type InsertSite = z.infer<typeof insertSiteSchema>;
export type Site = typeof sitesTable.$inferSelect;
