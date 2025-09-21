import { eq } from "drizzle-orm";
import type { AnyD1Database } from "drizzle-orm/d1";
import { type Tag, tag } from "../schema/image";
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
