import { and, asc, count, desc, eq, inArray, sql } from "drizzle-orm";
import type { AnyD1Database } from "drizzle-orm/d1";
import { createDBActionError } from "../../lib/error";
import { type ImageStatus, type ImageWithTags, image, imageTag } from "../../schema";
import type { ActionResult } from "../../types/error";
import { getDB } from "../db";

export type FetchImagesOptions = {
  limit?: number;
  offset?: number;
  order?: "asc" | "desc";
  includeAllStatuses?: boolean;
};

export const DEFAULT_FETCH_IMAGES_LIMIT = 24;
export const DEFAULT_RANDOM_IMAGES_LIMIT = 10;

const THUMBHASH_HIDDEN_STATUSES: ImageStatus[] = ["moderation_violation", "error"];

/**
 * 違反・エラー画像のthumbhashをnullにする
 */
function maskThumbhash<T extends { status: ImageStatus; thumbhash: string | null }>(imageData: T): T {
  if (THUMBHASH_HIDDEN_STATUSES.includes(imageData.status)) {
    return { ...imageData, thumbhash: null };
  }

  return imageData;
}

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
      data: maskThumbhash({
        ...imageData,
        tags: imageTag.map((it) => it.tag),
      }),
    };
  } catch (error) {
    return createDBActionError("画像の取得に失敗しました", error);
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
  opts: FetchImagesOptions,
): Promise<ActionResult<ImageWithTags[]>> {
  try {
    const db = getDB(dbInstance);

    const whereCondition = opts.includeAllStatuses
      ? eq(image.userId, userId)
      : and(eq(image.userId, userId), eq(image.status, "published"));

    const results = await db.query.image.findMany({
      where: whereCondition,
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

        return maskThumbhash({
          ...imageData,
          tags: imageTag.map((it) => it.tag),
        });
      }),
    };
  } catch (error) {
    return createDBActionError("画像一覧の取得に失敗しました", error);
  }
}

/**
 * ユーザーIDからランダムに10件の画像を取得する
 * @param dbInstance D1インスタンス
 * @param userId ユーザーID
 * @param limit 取得件数（デフォルト: DEFAULT_RANDOM_IMAGES_LIMIT）
 * @returns ランダムに取得した画像一覧
 */
export async function fetchRandomImagesByUserId(
  dbInstance: AnyD1Database,
  userId: string,
  limit = DEFAULT_RANDOM_IMAGES_LIMIT,
): Promise<ActionResult<ImageWithTags[]>> {
  try {
    const db = getDB(dbInstance);

    const results = await db.query.image.findMany({
      where: and(eq(image.userId, userId), eq(image.status, "published")),
      orderBy: [sql`RANDOM()`],
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

        return maskThumbhash({
          ...imageData,
          tags: imageTag.map((it) => it.tag),
        });
      }),
    };
  } catch (error) {
    return createDBActionError("ランダム画像の取得に失敗しました", error);
  }
}

export type FetchTotalImageCountOptions = {
  includeAllStatuses?: boolean;
};

/**
 * ユーザーIDから総投稿画像数を取得する
 * @param dbInstance D1インスタンス
 * @param userId ユーザーID
 * @param opts オプション
 * @return 総投稿枚数
 */
export async function fetchTotalImageCountByUserId(
  dbInstance: AnyD1Database,
  userId: string,
  opts: FetchTotalImageCountOptions = {},
): Promise<ActionResult<number>> {
  try {
    const db = getDB(dbInstance);

    const whereCondition = opts.includeAllStatuses
      ? eq(image.userId, userId)
      : and(eq(image.userId, userId), eq(image.status, "published"));

    const result = await db.select({ count: count() }).from(image).where(whereCondition);

    return {
      success: true,
      data: result.at(0)?.count ?? 0,
    };
  } catch (error) {
    return createDBActionError("総投稿画像数の取得に失敗しました", error);
  }
}

/**
 * タグIDから画像一覧を取得する
 * @param dbInstance D1インスタンス
 * @param tagId タグID
 * @param opts オプション
 * @returns 画像一覧
 */
export async function fetchImagesByTagId(
  dbInstance: AnyD1Database,
  tagId: string,
  opts: FetchImagesOptions,
): Promise<ActionResult<ImageWithTags[]>> {
  try {
    const db = getDB(dbInstance);

    // 指定されたタグIDを持つ画像IDを取得
    const whereCondition = opts.includeAllStatuses
      ? eq(imageTag.tagId, tagId)
      : and(eq(imageTag.tagId, tagId), eq(image.status, "published"));

    const imageIdResults = await db
      .select({ imageId: imageTag.imageId, createdAt: image.createdAt })
      .from(imageTag)
      .innerJoin(image, eq(imageTag.imageId, image.id))
      .where(whereCondition)
      .orderBy(opts.order === "asc" ? asc(image.createdAt) : desc(image.createdAt))
      .limit(opts.limit ?? DEFAULT_FETCH_IMAGES_LIMIT)
      .offset(opts.offset ?? 0);

    if (imageIdResults.length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    const imageIds = imageIdResults.map((r) => r.imageId);

    // 画像IDから完全な画像とタグを取得
    const results = await db.query.image.findMany({
      where: inArray(image.id, imageIds),
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

    // 元の順序を維持するためにソート
    const sortedResults = results.sort((a, b) => {
      const indexA = imageIds.indexOf(a.id);
      const indexB = imageIds.indexOf(b.id);
      return indexA - indexB;
    });

    return {
      success: true,
      data: sortedResults.map((result) => {
        const { imageTag, ...imageData } = result;

        return maskThumbhash({
          ...imageData,
          tags: imageTag.map((it) => it.tag),
        });
      }),
    };
  } catch (error) {
    return createDBActionError("タグIDからの画像一覧の取得に失敗しました", error);
  }
}

/**
 * タグIDからランダムに画像を取得する
 * @param dbInstance D1インスタンス
 * @param tagId タグID
 * @param limit 取得件数（デフォルト: DEFAULT_RANDOM_IMAGES_LIMIT）
 * @returns ランダムに取得した画像一覧
 */
export async function fetchRandomImagesByTagId(
  dbInstance: AnyD1Database,
  tagId: string,
  limit = DEFAULT_RANDOM_IMAGES_LIMIT,
): Promise<ActionResult<ImageWithTags[]>> {
  try {
    const db = getDB(dbInstance);

    // 1. タグIDに紐づく公開済み画像IDをランダムに取得
    const imageIdResults = await db
      .select({
        imageId: imageTag.imageId,
      })
      .from(imageTag)
      .innerJoin(image, eq(imageTag.imageId, image.id))
      .where(and(eq(imageTag.tagId, tagId), eq(image.status, "published")))
      .orderBy(sql`RANDOM()`)
      .limit(limit);

    if (imageIdResults.length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    const imageIds = imageIdResults.map((r) => r.imageId);

    // 2. 画像IDを使って完全な画像データとタグを取得
    const results = await db.query.image.findMany({
      where: inArray(image.id, imageIds),
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

        return maskThumbhash({
          ...imageData,
          tags: imageTag.map((it) => it.tag),
        });
      }),
    };
  } catch (error) {
    return createDBActionError("タグIDからのランダム画像一覧の取得に失敗しました", error);
  }
}

/**
 * タグIDから総投稿画像数を取得する
 * @param dbInstance D1インスタンス
 * @param tagId タグID
 * @param opts オプション
 * @return 総投稿枚数
 */
export async function fetchTotalImageCountByTagId(
  dbInstance: AnyD1Database,
  tagId: string,
  opts: FetchTotalImageCountOptions = {},
): Promise<ActionResult<number>> {
  try {
    const db = getDB(dbInstance);

    const whereCondition = opts.includeAllStatuses
      ? eq(imageTag.tagId, tagId)
      : and(eq(imageTag.tagId, tagId), eq(image.status, "published"));

    const result = await db
      .select({ count: count() })
      .from(imageTag)
      .innerJoin(image, eq(imageTag.imageId, image.id))
      .where(whereCondition);

    return {
      success: true,
      data: result.at(0)?.count ?? 0,
    };
  } catch (error) {
    return createDBActionError("タグIDからの総投稿画像数の取得に失敗しました", error);
  }
}
