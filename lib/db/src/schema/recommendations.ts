import { pgTable, serial, integer, text, real, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const priorityEnum = pgEnum("recommendation_priority", ["high", "medium", "low"]);

export const recommendationsTable = pgTable("recommendations", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").notNull(),
  priority: priorityEnum("priority").notNull().default("medium"),
  titleAr: text("title_ar").notNull(),
  descriptionAr: text("description_ar").notNull(),
  expectedSaving: real("expected_saving").notNull().default(0),
  timeWindow: text("time_window").notNull(),
});

export const insertRecommendationSchema = createInsertSchema(recommendationsTable).omit({ id: true });
export type InsertRecommendation = z.infer<typeof insertRecommendationSchema>;
export type Recommendation = typeof recommendationsTable.$inferSelect;
