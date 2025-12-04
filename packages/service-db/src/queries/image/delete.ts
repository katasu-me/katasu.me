import { and, eq } from "drizzle-orm";
import type { AnyD1Database } from "drizzle-orm/d1";
import { createDBActionError } from "../../lib/error";
import { image } from "../../schema";
import type { ActionResult } from "../../types/error";
import { getDB } from "../db";

/**
 * 画像を削除する
 * @param dbInstance D1インスタンス
 * @param imageId 画像ID
 * @param userId ユーザーID
 * @returns 削除結果
 */
export async function deleteImage(
  dbInstance: AnyD1Database,
  imageId: string,
  userId: string,
): Promise<ActionResult<void>> {
  try {
    const db = getDB(dbInstance);

    const imageResult = await db
      .delete(image)
      .where(and(eq(image.id, imageId), eq(image.userId, userId)))
      .returning({ id: image.id });

    if (imageResult.length === 0) {
      return {
        success: false,
        error: { message: "画像が見つからないか、削除する権限がありません" },
      };
    }

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "画像の削除に失敗しました";
    return createDBActionError(message, error);
  }
}
