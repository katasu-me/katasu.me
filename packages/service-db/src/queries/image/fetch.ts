import { and, asc, count, desc, eq, inArray, ne, sql } from "drizzle-orm";
import type { AnyD1Database } from "drizzle-orm/d1";
import { createDBActionError } from "../../lib/error";
import { type ImageWithTags, image, imageTag, tag } from "../../schema";
import type { ActionResult } from "../../types/error";
import { getDB } from "../db";

export type FetchImagesOptions = {
  limit?: number;
  offset?: number;
  order?: "asc" | "desc";
};

export const DEFAULT_FETCH_IMAGES_LIMIT = 24;
export const DEFAULT_RANDOM_IMAGES_LIMIT = 10;
export const MAX_TAGS_PER_IMAGE = 10; // 1画像あたりのタグ最大数

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

    const results = await db.query.image.findMany({
      where: and(eq(image.userId, userId), ne(image.status, "moderation_violation")),
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
      where: and(eq(image.userId, userId), ne(image.status, "moderation_violation")),
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

        return {
          ...imageData,
          tags: imageTag.map((it) => it.tag),
        };
      }),
    };
  } catch (error) {
    return createDBActionError("ランダム画像の取得に失敗しました", error);
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

    // 指定されたタグIDを持つ、公開・処理中の画像のリストを取得
    const targetImageIdsSubquery = db
      .select({ imageId: imageTag.imageId })
      .from(imageTag)
      .innerJoin(image, eq(imageTag.imageId, image.id))
      .where(and(eq(imageTag.tagId, tagId), ne(image.status, "moderation_violation")))
      .as("target_images");

    // 画像とそのタグを取得
    const results = await db
      .select({
        imageId: image.id,
        userId: image.userId,
        width: image.width,
        height: image.height,
        title: image.title,
        status: image.status,
        thumbhash: image.thumbhash,
        createdAt: image.createdAt,
        updatedAt: image.updatedAt,
        tagId: tag.id,
        tagName: tag.name,
        tagCreatedAt: tag.createdAt,
        tagHiddenAt: tag.hiddenAt,
      })
      .from(image)
      .innerJoin(targetImageIdsSubquery, eq(image.id, targetImageIdsSubquery.imageId))
      .leftJoin(imageTag, eq(image.id, imageTag.imageId))
      .leftJoin(tag, eq(imageTag.tagId, tag.id))
      .orderBy(opts.order === "asc" ? asc(image.createdAt) : desc(image.createdAt))
      .limit((opts.limit ?? DEFAULT_FETCH_IMAGES_LIMIT) * MAX_TAGS_PER_IMAGE) // 1画像あたり最大10タグなので10倍取得
      .offset(opts.offset ?? 0);

    if (results.length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    // 結果を画像ごとにグループ化
    const imageMap = new Map<string, ImageWithTags>();

    for (const row of results) {
      if (!imageMap.has(row.imageId)) {
        imageMap.set(row.imageId, {
          id: row.imageId,
          userId: row.userId,
          width: row.width,
          height: row.height,
          title: row.title,
          status: row.status,
          thumbhash: row.thumbhash,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          tags: [],
        });
      }

      // タグを追加
      if (row.tagId && row.tagName && row.tagCreatedAt) {
        const imageData = imageMap.get(row.imageId);

        if (imageData) {
          imageData.tags.push({
            id: row.tagId,
            name: row.tagName,
            createdAt: row.tagCreatedAt,
            hiddenAt: row.tagHiddenAt,
          });
        }
      }
    }

    // limitを適用（タグでグループ化した後）
    const images = Array.from(imageMap.values()).slice(0, opts.limit ?? DEFAULT_FETCH_IMAGES_LIMIT);

    return {
      success: true,
      data: images,
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

    // 1. タグIDに紐づく公開・処理中の画像IDをランダムに取得
    const imageIdResults = await db
      .select({
        imageId: imageTag.imageId,
      })
      .from(imageTag)
      .innerJoin(image, eq(imageTag.imageId, image.id))
      .where(and(eq(imageTag.tagId, tagId), ne(image.status, "moderation_violation")))
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

        return {
          ...imageData,
          tags: imageTag.map((it) => it.tag),
        };
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
 * @return 総投稿枚数
 */
export async function fetchTotalImageCountByTagId(
  dbInstance: AnyD1Database,
  tagId: string,
): Promise<ActionResult<number>> {
  try {
    const db = getDB(dbInstance);

    const result = await db.select({ count: count() }).from(imageTag).where(eq(imageTag.tagId, tagId));

    return {
      success: true,
      data: result.at(0)?.count ?? 0,
    };
  } catch (error) {
    return createDBActionError("タグIDからの総投稿画像数の取得に失敗しました", error);
  }
}
