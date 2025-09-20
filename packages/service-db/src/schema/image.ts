import { relations, sql } from "drizzle-orm";
import { index, integer, primaryKey, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";
import { user } from "./user";

/**
 * 画像
 */
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

export const imageRelations = relations(image, ({ one, many }) => ({
  user: one(user, {
    fields: [image.userId],
    references: [user.id],
  }),
  imageTag: many(imageTag),
}));

export type Image = typeof image.$inferSelect;

/**
 * タグ
 */
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
    isHidden: integer("is_hidden", { mode: "boolean" }).notNull().default(false),
  },
  (table) => [unique("unique_user_tag_name").on(table.userId, table.name)],
);

export const tagRelations = relations(tag, ({ one, many }) => ({
  user: one(user, {
    fields: [tag.userId],
    references: [user.id],
  }),
  imageTag: many(imageTag),
}));

export type Tag = typeof tag.$inferSelect;

/**
 * 画像とタグの中間テーブル
 */
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
  (table) => [primaryKey({ columns: [table.imageId, table.tagId] })],
);

export const imageTagRelations = relations(imageTag, ({ one }) => ({
  image: one(image, {
    fields: [imageTag.imageId],
    references: [image.id],
  }),
  tag: one(tag, {
    fields: [imageTag.tagId],
    references: [tag.id],
  }),
}));

export type ImageTag = typeof imageTag.$inferSelect;
