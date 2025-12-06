import { and, eq } from "drizzle-orm";
import type { AnyD1Database } from "drizzle-orm/d1";
import { type ImageStatus as ImageStatusEnum, image, user } from "../../schema";
import type { ActionResult } from "../../types/error";
import { getDB } from "../db";

export type ImageStatusResult = {
  exists: boolean;
  status: ImageStatusEnum | null;
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
): Promise<ActionResult<ImageStatusResult>> {
  try {
    const db = getDB(dbInstance);

    const result = await db
      .select({
        status: image.status,
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
          status: null,
          userBanned: false,
        },
      };
    }

    return {
      success: true,
      data: {
        exists: true,
        status: result.status,
        userBanned: result.bannedAt !== null,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: "画像の状態チェックに失敗しました",
        rawError: error instanceof Error ? error : undefined,
      },
    };
  }
}
