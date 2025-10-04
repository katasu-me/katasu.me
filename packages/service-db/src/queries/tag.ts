import { count, desc, eq } from "drizzle-orm";
import type { AnyD1Database } from "drizzle-orm/d1";
import { imageTag, type Tag, tag } from "../schema/image";
import type { ActionResult } from "../types/error";
import { getDB } from "./db";

/**
 * タグを非表示にする
 * @param dbInstance D1インスタンス
 * @param tagId タグID
 * @returns 更新結果
 */
export async function hideTag(dbInstance: AnyD1Database, tagId: string): Promise<Tag> {
  const db = getDB(dbInstance);

  return await db.update(tag).set({ isHidden: true }).where(eq(tag.id, tagId)).returning().get();
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
    return {
      success: false,
      error: {
        message: "タグの取得に失敗しました",
        rawError: error,
      },
    };
  }
}

/**
 * ユーザーのタグ一覧を取得する
 * @param dbInstance D1インスタンス
 * @param userId ユーザーID
 * @param order 並び順
 * @returns タグ一覧
 */
export async function fetchTagsByUserId(
  dbInstance: AnyD1Database,
  userId: string,
  order?: "usage" | "name",
): Promise<ActionResult<Tag[]>> {
  try {
    const db = getDB(dbInstance);

    // 使用頻度順
    if (order === "usage") {
      const usageCount = count(imageTag.imageId).as("usage_count");

      const results = await db
        .select({
          id: tag.id,
          userId: tag.userId,
          name: tag.name,
          isHidden: tag.isHidden,
        })
        .from(tag)
        .leftJoin(imageTag, eq(tag.id, imageTag.tagId))
        .where(eq(tag.userId, userId))
        .groupBy(tag.id)
        .orderBy(desc(usageCount));

      return {
        success: true,
        data: results,
      };
    }

    // 名前順
    const results = await db.select().from(tag).where(eq(tag.userId, userId)).orderBy(tag.name);

    return {
      success: true,
      data: results,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: "タグの取得に失敗しました",
        rawError: error,
      },
    };
  }
}
