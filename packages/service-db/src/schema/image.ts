import { relations, sql } from "drizzle-orm";
import { index, integer, primaryKey, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";
import { user } from "./user";

/**
 * 画像ステータス
 */
export const imageStatusEnum = ["processing", "published", "moderation_violation", "error"] as const;
export type ImageStatus = (typeof imageStatusEnum)[number];

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
    width: integer("width").notNull(),
    height: integer("height").notNull(),
    title: text("title"),
    status: text("status", { enum: imageStatusEnum }).notNull().default("processing"),
    thumbhash: text("thumbhash"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`)
      .$onUpdate(() => new Date()),
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

export type ImageWithTags = Image & {
  tags: Omit<Tag, "userId">[];
};

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
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
    hiddenAt: integer("hidden_at", { mode: "timestamp" }),
  },
  (table) => [unique("unique_user_tag_name").on(table.userId, table.name), index("idx_tag_user_id").on(table.userId)],
);

export const tagRelations = relations(tag, ({ one, many }) => ({
  user: one(user, {
    fields: [tag.userId],
    references: [user.id],
  }),
  imageTag: many(imageTag),
}));

export type Tag = typeof tag.$inferSelect;

export type TagWithImages = Tag & {
  images: Omit<Image, "userId">[];
};

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
  (table) => [
    primaryKey({ columns: [table.imageId, table.tagId] }),
    index("idx_image_tag_tag_id").on(table.tagId),
    index("idx_image_tag_image_id").on(table.imageId),
  ],
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
