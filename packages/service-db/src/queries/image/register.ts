import { eq, sql } from "drizzle-orm";
import type { AnyD1Database } from "drizzle-orm/d1";
import { createDBActionError } from "../../lib/error";
import { type Image, type ImageWithTags, image, imageTag, type Tag, tag } from "../../schema";
import type { ActionResult } from "../../types/error";
import type { ImageFormData } from "../../types/image";
import { getDB } from "../db";
import { fetchUserImageStatus } from "../user";
import { deleteImage } from "./delete";

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
  const userImageStatusResult = await fetchUserImageStatus(dbInstance, userId);

  if (!userImageStatusResult.success) {
    return {
      success: false,
      error: userImageStatusResult.error,
    };
  }

  if (!userImageStatusResult.data) {
    return {
      success: false,
      error: { message: "ユーザーが見つかりません" },
    };
  }

  const userImageStatus = userImageStatusResult.data;

  if (userImageStatus.uploadedPhotos >= userImageStatus.maxPhotos) {
    return {
      success: false,
      error: { message: "画像の投稿上限に達しています" },
    };
  }

  const { tags, ...newImageData } = imageData;

  // タグが指定されていないなら、画像の登録だけ行う
  if (!tags || tags.length === 0) {
    try {
      // 画像を登録
      const insertImageResult = await db
        .insert(image)
        .values({ userId, ...newImageData })
        .returning()
        .get();

      if (!insertImageResult) {
        return {
          success: false,
          error: { message: "不明なエラーで画像の登録に失敗しました" },
        };
      }

      return {
        success: true,
        data: { ...insertImageResult, tags: [] },
      };
    } catch (error) {
      return createDBActionError("画像の登録に失敗しました", error);
    }
  }

  let insertImageResults: Image[];
  let insertTagResults: Tag[];

  try {
    [insertImageResults, insertTagResults] = await db.batch([
      // 画像を登録
      db
        .insert(image)
        .values({ userId, ...newImageData })
        .returning(),
      // タグを登録
      db
        .insert(tag)
        .values(tags.map((name) => ({ userId, name })))
        .onConflictDoUpdate({
          target: [tag.userId, tag.name],
          set: { name: sql`excluded.name` }, // 既にあるタグも取得したいので
        })
        .returning(),
    ]);
  } catch (error) {
    return createDBActionError("画像もしくはタグの登録に失敗しました", error);
  }

  const imageId = newImageData.id;
  const imageResult = insertImageResults.at(0);

  // あんまないと思うけど念のため
  if (!imageResult) {
    await deleteImage(dbInstance, imageId, userId).catch(() => {
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

    return createDBActionError("タグの設定に失敗しました", error);
  }
}
