import { eq } from "drizzle-orm";
import type { AnyD1Database } from "drizzle-orm/d1";
import { user } from "../../schema";
import type { ActionResult } from "../../types/error";
import { getDB } from "../db";

export type AvatarStatus = {
  exists: boolean;
  userBanned: boolean;
  hasAvatar: boolean;
};

/**
 * アバター画像の状態をチェックする
 * @param dbInstance D1インスタンス
 * @param userId ユーザーID
 * @returns アバターの状態
 */
export async function checkAvatarStatus(
  dbInstance: AnyD1Database,
  userId: string,
): Promise<ActionResult<AvatarStatus>> {
  try {
    const db = getDB(dbInstance);

    const result = await db
      .select({
        bannedAt: user.bannedAt,
        avatarSetAt: user.avatarSetAt,
      })
      .from(user)
      .where(eq(user.id, userId))
      .get();

    if (!result) {
      return {
        success: true,
        data: {
          exists: false,
          userBanned: false,
          hasAvatar: false,
        },
      };
    }

    return {
      success: true,
      data: {
        exists: true,
        userBanned: result.bannedAt !== null,
        hasAvatar: result.avatarSetAt !== null,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: "アバターの状態チェックに失敗しました",
        rawError: error,
      },
    };
  }
}
