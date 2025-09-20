import { eq, sql } from "drizzle-orm";
import type { AnyD1Database } from "drizzle-orm/d1";
import { nanoid } from "nanoid";
import { type Image, type ImageWithTags, image, imageTag, type Tag, tag, user } from "../../schema";
import type { ActionResult } from "../../types/error";
import { getDB } from "../db";
import { getUserImageStatus } from "../user";
import { deleteImage } from "./delete";
import type { ImageFormData } from "./types";

/**
 * 画像を登録する
 * @param dbInstance D1インスタンス
 * @param userId ユーザーID
 * @param imageData 画像データ
 * @returns 登録結果
 */
export async function registerImage(
  dbInstance: AnyD1Database,
  userId: string,
  imageData: ImageFormData,
): Promise<ActionResult<ImageWithTags>> {
  const db = getDB(dbInstance);

  // ユーザーの画像投稿上限を超えていないか確認
  const userImageStatus = await getUserImageStatus(dbInstance, userId);

  if (!userImageStatus) {
    return {
      success: false,
      error: { message: "ユーザーが見つかりません" },
    };
  }

  if (userImageStatus.uploadedPhotos >= userImageStatus.maxPhotos) {
    return {
      success: false,
      error: { message: "画像の投稿上限に達しています" },
    };
  }

  const { tags, ...newImageData } = imageData;
  const imageId = nanoid();

  // タグが指定されていない場合は画像の登録だけ行う
  if (!tags || tags.length === 0) {
    try {
      const imageResult = await db
        .insert(image)
        .values({
          id: imageId,
          userId,
          ...newImageData,
        })
        .returning()
        .get();

      return {
        success: true,
        data: {
          ...imageResult,
          tags: [],
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: "画像の登録に失敗しました",
          rawError: error,
        },
      };
    }
  }

  let insertImageResult: Image[];
  let insertTagResults: Tag[];

  try {
    [insertImageResult, insertTagResults] = await db.batch([
      // 画像を登録
      db
        .insert(image)
        .values({
          id: imageId,
          userId,
          ...newImageData,
        })
        .returning(),
      // タグを登録
      db
        .insert(tag)
        .values(tags.map((name) => ({ userId, name })))
        .onConflictDoNothing({
          target: [tag.userId, tag.name],
        })
        .returning(),
      // ユーザーの投稿枚数を更新
      db
        .update(user)
        .set({ uploadedPhotos: sql`${user.uploadedPhotos} + 1` })
        .where(eq(user.id, userId)),
    ]);
  } catch (error) {
    return {
      success: false,
      error: {
        message: "画像もしくはタグの登録に失敗しました",
        rawError: error,
      },
    };
  }

  const imageResult = insertImageResult.at(0);

  // あんまないと思うけど念のため
  if (!imageResult) {
    await deleteImage(dbInstance, userId, imageId).catch(() => {
      // 失敗しても無視
    });

    return {
      success: false,
      error: { message: "不明なエラーで画像の登録に失敗しました" },
    };
  }

  try {
    // 画像とタグの関連付け
    await db
      .insert(imageTag)
      .values(
        insertTagResults.map((tag) => ({
          imageId,
          tagId: tag.id,
        })),
      )
      .returning();

    return {
      success: true,
      data: {
        ...imageResult,
        tags: insertTagResults,
      },
    };
  } catch (error) {
    // 関連付けが失敗した場合、作成した画像を削除
    if (imageId) {
      await db
        .delete(image)
        .where(eq(image.id, imageId))
        .catch(() => {});
    }

    return {
      success: false,
      error: {
        message: "タグの設定に失敗しました",
        rawError: error,
      },
    };
  }
}
