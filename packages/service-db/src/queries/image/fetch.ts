import { asc, count, desc, eq, sql } from "drizzle-orm";
import type { AnyD1Database } from "drizzle-orm/d1";
import { type ImageWithTags, image } from "../../schema";
import type { ActionResult } from "../../types/error";
import { getDB } from "../db";

export type GetImagesByUserIdOptions = {
  limit?: number;
  offset?: number;
  order?: "asc" | "desc";
};

export const DEFAULT_FETCH_IMAGES_LIMIT = 24;
export const DEFAULT_RANDOM_IMAGES_LIMIT = 10;

/**
 * 画像IDから画像を取得する
 * @param dbInstance D1インスタンス
 * @param imageId 画像ID
 * @returns 画像情報、存在しない場合はundefined
 */
export async function fetchImageById(
  dbInstance: AnyD1Database,
  imageId: string,
): Promise<ActionResult<ImageWithTags | undefined>> {
  try {
    const db = getDB(dbInstance);

    const results = await db.query.image.findFirst({
      where: eq(image.id, imageId),
      with: {
        imageTag: {
          columns: {
            tagId: false,
            imageId: false,
          },
          with: {
            tag: {
              columns: {
                userId: false,
              },
            },
          },
        },
      },
    });

    if (!results) {
      return {
        success: true,
        data: undefined,
      };
    }

    const { imageTag, ...imageData } = results;

    return {
      success: true,
      data: {
        ...imageData,
        tags: imageTag.map((it) => it.tag),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: "画像の取得に失敗しました",
        rawError: error,
      },
    };
  }
}

/**
 * ユーザーIDから画像一覧を取得する
 * @param dbInstance D1インスタンス
 * @param userId ユーザーID
 * @returns 画像一覧
 */
export async function fetchImagesByUserId(
  dbInstance: AnyD1Database,
  userId: string,
  opts: GetImagesByUserIdOptions,
): Promise<ActionResult<ImageWithTags[]>> {
  try {
    const db = getDB(dbInstance);

    const results = await db.query.image.findMany({
      where: eq(image.userId, userId),
      orderBy: [opts.order === "asc" ? asc(image.createdAt) : desc(image.createdAt)],
      limit: opts.limit ?? DEFAULT_FETCH_IMAGES_LIMIT,
      offset: opts.offset ?? 0,
      with: {
        imageTag: {
          with: {
            tag: {
              columns: {
                userId: false,
              },
            },
          },
        },
      },
    });

    return {
      success: true,
      data: results.map((result) => {
        const { imageTag, ...imageData } = result;

        return {
          ...imageData,
          tags: imageTag.map((it) => it.tag),
        };
      }),
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: "画像一覧の取得に失敗しました",
        rawError: error,
      },
    };
  }
}

/**
 * ユーザーIDからランダムに10件の画像を取得する
 * @param dbInstance D1インスタンス
 * @param userId ユーザーID
 * @returns ランダムに取得した画像一覧
 */
export async function getRandomImagesByUserId(
  dbInstance: AnyD1Database,
  userId: string,
  limit = DEFAULT_RANDOM_IMAGES_LIMIT,
): Promise<ActionResult<ImageWithTags[]>> {
  try {
    const db = getDB(dbInstance);

    const results = await db.query.image.findMany({
      where: eq(image.userId, userId),
      orderBy: [sql`RANDOM()`], // TODO: 要検証
      limit,
      with: {
        imageTag: {
          with: {
            tag: {
              columns: {
                userId: false,
              },
            },
          },
        },
      },
    });

    return {
      success: true,
      data: results.map((result) => {
        const { imageTag, ...imageData } = result;

        return {
          ...imageData,
          tags: imageTag.map((it) => it.tag),
        };
      }),
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: "ランダム画像の取得に失敗しました",
        rawError: error,
      },
    };
  }
}

/**
 * ユーザーIDから総投稿画像数を取得する
 * @param dbInstance D1インスタンス
 * @param userId ユーザーID
 * @return 総投稿枚数
 */
export async function fetchTotalImageCountByUserId(
  dbInstance: AnyD1Database,
  userId: string,
): Promise<ActionResult<number>> {
  try {
    const db = getDB(dbInstance);

    const result = await db.select({ count: count() }).from(image).where(eq(image.userId, userId));

    return {
      success: true,
      data: result.at(0)?.count ?? 0,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: "総投稿画像数の取得に失敗しました",
        rawError: error,
      },
    };
  }
}
