import { sql } from "drizzle-orm";
import { index, integer, primaryKey, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";
import { user } from "./user";

export const image = sqliteTable(
  "image",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    filename: text("filename").notNull(),
    width: integer("width").notNull(),
    height: integer("height").notNull(),
    title: text("title"),
    isHidden: integer("is_hidden", { mode: "boolean" }).notNull().default(false),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  },
  (table) => [index("idx_image_user_id_created_at").on(table.userId, table.createdAt)],
);

export type Image = typeof image.$inferSelect;

export const tag = sqliteTable(
  "tag",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    imageCount: integer("image_count").notNull().default(0),
    isHidden: integer("is_hidden", { mode: "boolean" }).notNull().default(false),
  },
  (table) => [
    unique("unique_user_tag_name").on(table.userId, table.name),
    index("idx_tag_user_id_image_count").on(table.userId, table.imageCount),
    index("idx_tag_user_id_name").on(table.userId, table.name),
  ],
);

export type Tag = typeof tag.$inferSelect;

export const imageTag = sqliteTable(
  "image_tag",
  {
    imageId: text("image_id")
      .notNull()
      .references(() => image.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tag.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.imageId, table.tagId] }),
    index("idx_image_tag_image_id").on(table.imageId),
    index("idx_image_tag_tag_id").on(table.tagId),
  ],
);

export type ImageTag = typeof imageTag.$inferSelect;
