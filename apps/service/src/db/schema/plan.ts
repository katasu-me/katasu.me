import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const plan = sqliteTable("plan", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
});
