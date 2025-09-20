import { relations } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "./user";

export const plan = sqliteTable("plan", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const planRelations = relations(plan, ({ one }) => ({
  user: one(user, {
    fields: [plan.id],
    references: [user.plan],
  }),
}));

export type Plan = typeof plan.$inferSelect;
