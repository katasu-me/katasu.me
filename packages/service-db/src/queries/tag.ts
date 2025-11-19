import { count, desc, eq } from "drizzle-orm";
import type { AnyD1Database } from "drizzle-orm/d1";
import { createDBActionError } from "../lib/error";
import { imageTag, type Tag, tag } from "../schema/image";
import type { ActionResult } from "../types/error";
import { getDB } from "./db";

/**
 * タグを非表示にする
 * @param dbInstance D1インスタンス
 * @param tagId タグID
 * @returns 更新結果
 */
export async function hideTag(dbInstance: AnyD1Database, tagId: string): Promise<ActionResult<Tag>> {
  try {
    const db = getDB(dbInstance);

    const result = await db
      .update(tag)
      .set({
        hiddenAt: new Date(),
      })
      .where(eq(tag.id, tagId))
      .returning()
      .get();

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return createDBActionError("タグの非表示化に失敗しました", error);
  }
}

/**
 * タグIDからタグを取得する
 * @param dbInstance D1インスタンス
 * @param tagId タグID
 * @returns タグ情報、存在しない場合はundefined
 */
export async function fetchTagById(dbInstance: AnyD1Database, tagId: string): Promise<ActionResult<Tag | undefined>> {
  try {
    const db = getDB(dbInstance);

    const result = await db.select().from(tag).where(eq(tag.id, tagId)).get();

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return createDBActionError("タグの取得に失敗しました", error);
  }
}

type FetchTagsOptions = {
  limit?: number;
  order?: "usage" | "name";
};

/**
 * ユーザーのタグ一覧を取得する
 * @param dbInstance D1インスタンス
 * @param userId ユーザーID
 * @param opts オプション
 * @returns タグ一覧
 */
export async function fetchTagsByUserId(
  dbInstance: AnyD1Database,
  userId: string,
  opts?: FetchTagsOptions,
): Promise<ActionResult<Tag[]>> {
  try {
    const db = getDB(dbInstance);

    // 使用頻度順
    if (opts?.order === "usage") {
      const usageCount = count(imageTag.imageId).as("usage_count");

      let query = db
        .select({
          id: tag.id,
          userId: tag.userId,
          name: tag.name,
          usageCount: usageCount,
          createdAt: tag.createdAt,
          hiddenAt: tag.hiddenAt,
        })
        .from(tag)
        .leftJoin(imageTag, eq(tag.id, imageTag.tagId))
        .where(eq(tag.userId, userId))
        .groupBy(tag.id)
        .orderBy(desc(usageCount))
        .$dynamic();

      if (opts.limit) {
        query = query.limit(opts.limit);
      }

      const results = await query;

      // usageCountを除外
      return {
        success: true,
        data: results.map(({ usageCount: _, ...tag }) => tag),
      };
    }

    // 名前順
    let query = db.select().from(tag).where(eq(tag.userId, userId)).orderBy(tag.name).$dynamic();

    if (opts?.limit) {
      query = query.limit(opts.limit);
    }

    const results = await query;

    return {
      success: true,
      data: results,
    };
  } catch (error) {
    return createDBActionError("タグの取得に失敗しました", error);
  }
}
