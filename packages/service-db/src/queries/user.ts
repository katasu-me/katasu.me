import { eq } from "drizzle-orm";

import type { AnyD1Database } from "drizzle-orm/d1";
import { type User, user } from "../schema";
import type { ActionResult } from "../types/error";
import { getDB } from "./db";
import { fetchTotalImageCountByUserId } from "./image/fetch";

export type UserWithMaxPhotos = User & {
  maxPhotos: number;
};

export type PublicUserData = Pick<
  UserWithMaxPhotos,
  "id" | "name" | "image" | "bannedAt" | "termsAgreedAt" | "privacyPolicyAgreedAt" | "maxPhotos"
>;

/**
 * ユーザーIDから公開可能なユーザー情報を取得する
 * @param dbInstance D1インスタンス
 * @param userId ユーザーID
 * @returns ユーザー情報、存在しない場合はundefined
 */
export async function getPublicUserDataById(
  dbInstance: AnyD1Database,
  userId: string,
): Promise<ActionResult<PublicUserData | undefined>> {
  try {
    const db = getDB(dbInstance);

    const result = await db.query.user.findFirst({
      where: (u) => eq(u.id, userId),
      columns: {
        id: true,
        name: true,
        image: true,
        bannedAt: true,
        termsAgreedAt: true,
        privacyPolicyAgreedAt: true,
      },
      with: {
        plan: {
          columns: {
            maxPhotos: true,
          },
        },
      },
    });

    return {
      success: true,
      data: result
        ? {
            ...result,
            maxPhotos: result.plan.maxPhotos,
          }
        : undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: "ユーザーの取得に失敗しました",
        rawError: error,
      },
    };
  }
}

/**
 * ユーザーIDからユーザーを取得する
 * @param dbInstance D1インスタンス
 * @param userId ユーザーID
 * @returns ユーザー情報、存在しない場合はundefined
 */
export async function getUserById(
  dbInstance: AnyD1Database,
  userId: string,
): Promise<ActionResult<UserWithMaxPhotos | undefined>> {
  try {
    const db = getDB(dbInstance);

    const result = await db.query.user.findFirst({
      where: (u) => eq(u.id, userId),
      with: {
        plan: {
          columns: {
            maxPhotos: true,
          },
        },
      },
    });

    return {
      success: true,
      data: result
        ? {
            ...result,
            maxPhotos: result.plan.maxPhotos,
          }
        : undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: "ユーザーの取得に失敗しました",
        rawError: error,
      },
    };
  }
}

export type UserImageStatus = {
  maxPhotos: number;
  uploadedPhotos: number;
};

/**
 * ユーザーの画像投稿状況を取得する
 * @param dbInstance D1インスタンス
 * @param userId ユーザーID
 * @returns ユーザーの画像投稿状況、存在しない場合はundefined
 */
export async function fetchUserImageStatus(
  dbInstance: AnyD1Database,
  userId: string,
): Promise<ActionResult<UserImageStatus | undefined>> {
  try {
    const db = getDB(dbInstance);

    const userInfo = await db.query.user.findFirst({
      where: (u) => eq(u.id, userId),
      with: {
        plan: {
          columns: {
            maxPhotos: true,
          },
        },
      },
    });

    if (!userInfo) {
      return {
        success: true,
        data: undefined,
      };
    }

    const uploadedPhotosResult = await fetchTotalImageCountByUserId(dbInstance, userId);

    if (!uploadedPhotosResult.success) {
      return {
        success: false,
        error: uploadedPhotosResult.error,
      };
    }

    return {
      success: true,
      data: {
        maxPhotos: userInfo.plan.maxPhotos,
        uploadedPhotos: uploadedPhotosResult.data,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: "ユーザーの画像投稿状況の取得に失敗しました",
        rawError: error,
      },
    };
  }
}

/**
 * ユーザー情報を更新する
 * @param dbInstance D1インスタンス
 * @param userId ユーザーID
 * @param updateData 更新データ
 * @returns 更新後のユーザー情報
 */
export async function updateUser(
  dbInstance: AnyD1Database,
  userId: string,
  updateData: Partial<Omit<User, "id">>,
): Promise<ActionResult<User | undefined>> {
  try {
    const db = getDB(dbInstance);

    const updatedUser = await db.update(user).set(updateData).where(eq(user.id, userId)).returning().get();

    return {
      success: true,
      data: updatedUser,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: "ユーザー情報の更新に失敗しました",
        rawError: error,
      },
    };
  }
}

/**
 * ユーザーをBANする
 * @param dbInstance D1インスタンス
 * @param userId ユーザーID
 * @returns 更新後のユーザー情報
 */
export async function banUser(dbInstance: AnyD1Database, userId: string): Promise<ActionResult<User | undefined>> {
  try {
    const db = getDB(dbInstance);

    const result = await db
      .update(user)
      .set({
        bannedAt: new Date(),
      })
      .where(eq(user.id, userId))
      .returning()
      .get();

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: "ユーザーのBAN処理に失敗しました",
        rawError: error,
      },
    };
  }
}
