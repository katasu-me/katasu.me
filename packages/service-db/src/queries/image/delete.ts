import { eq, sql } from "drizzle-orm";
import type { AnyD1Database } from "drizzle-orm/d1";
import { image, imageTag, user } from "../../schema";
import type { ActionResult } from "../../types/error";
import { getDB } from "../db";

/**
 * 画像を削除する
 * @param dbInstance D1インスタンス
 * @param userId ユーザーID
 * @param imageId 画像ID
 * @returns 削除結果
 */
export async function deleteImage(
  dbInstance: AnyD1Database,
  userId: string,
  imageId: string,
): Promise<ActionResult<void>> {
  try {
    const db = getDB(dbInstance);

    await db.batch([
      // 画像とタグの関連を削除
      db
        .delete(imageTag)
        .where(eq(imageTag.imageId, imageId)),
      // 画像を削除
      db
        .delete(image)
        .where(eq(image.id, imageId)),
      // ユーザーの投稿枚数を更新
      db
        .update(user)
        .set({ uploadedPhotos: sql`${user.uploadedPhotos} - 1` })
        .where(eq(user.id, userId)),
    ]);

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : "画像の削除に失敗しました",
        rawError: error,
      },
    };
  }
}
