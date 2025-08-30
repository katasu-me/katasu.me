import { sql } from "drizzle-orm";
import { index, integer, primaryKey, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";
import { user } from "./user";

export const photo = sqliteTable(
  "photo",
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
  (table) => [index("idx_photo_user_id_created_at").on(table.userId, table.createdAt)],
);

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
    photoCount: integer("photo_count").notNull().default(0),
    isHidden: integer("is_hidden", { mode: "boolean" }).notNull().default(false),
  },
  (table) => [
    unique("unique_user_tag_name").on(table.userId, table.name),
    index("idx_tag_user_id_photo_count").on(table.userId, table.photoCount),
    index("idx_tag_user_id_name").on(table.userId, table.name),
  ],
);

export const photoTag = sqliteTable(
  "photo_tag",
  {
    photoId: text("photo_id")
      .notNull()
      .references(() => photo.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tag.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.photoId, table.tagId] }),
    index("idx_photo_tag_photo_id").on(table.photoId),
    index("idx_photo_tag_tag_id").on(table.tagId),
  ],
);
