import { and, eq } from "drizzle-orm";
import type { AnyD1Database } from "drizzle-orm/d1";
import { image, user } from "../../schema";
import type { ActionResult } from "../../types/error";
import { getDB } from "../db";

export type ImageStatus = {
  exists: boolean;
  hidden: boolean;
  userBanned: boolean;
};

/**
 * 画像の状態をチェックする
 * @param dbInstance D1インスタンス
 * @param imageId 画像ID
 * @param userId ユーザーID
 * @returns 画像の状態
 */
export async function checkImageStatus(
  dbInstance: AnyD1Database,
  imageId: string,
  userId: string,
): Promise<ActionResult<ImageStatus>> {
  try {
    const db = getDB(dbInstance);

    const result = await db
      .select({
        hiddenAt: image.hiddenAt,
        bannedAt: user.bannedAt,
      })
      .from(image)
      .innerJoin(user, eq(image.userId, user.id))
      .where(and(eq(image.id, imageId), eq(image.userId, userId)))
      .get();

    if (!result) {
      return {
        success: true,
        data: {
          exists: false,
          hidden: false,
          userBanned: false,
        },
      };
    }

    return {
      success: true,
      data: {
        exists: true,
        hidden: result.hiddenAt !== null,
        userBanned: result.bannedAt !== null,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: "画像の状態チェックに失敗しました",
        rawError: error,
      },
    };
  }
}
