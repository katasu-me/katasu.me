import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "./user";

export const plan = sqliteTable("plan", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  maxPhotos: integer("maxPhotos").notNull(),
});

export const planRelations = relations(plan, ({ one }) => ({
  user: one(user, {
    fields: [plan.id],
    references: [user.planId],
  }),
}));

export type Plan = typeof plan.$inferSelect;
