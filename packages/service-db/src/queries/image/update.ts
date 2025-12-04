import { and, eq, sql } from "drizzle-orm";
import type { AnyD1Database } from "drizzle-orm/d1";
import { createDBActionError } from "../../lib/error";
import { type Image, type ImageWithTags, image, imageTag, tag } from "../../schema";
import type { ActionResult } from "../../types/error";
import type { ImageFormData } from "../../types/image";
import { getDB } from "../db";

/**
 * 画像情報を更新する
 * @param dbInstance D1インスタンス
 * @param imageId 画像ID
 * @param userId ユーザーID
 * @param imageData 更新データ
 * @returns 更新後の画像情報
 */
export async function updateImage(
  dbInstance: AnyD1Database,
  imageId: string,
  userId: string,
  imageData: Partial<Pick<ImageFormData, "title" | "tags">>,
): Promise<ActionResult<ImageWithTags>> {
  try {
    const db = getDB(dbInstance);

    const { tags, ...restImageData } = imageData;

    const imageResult = await db
      .update(image)
      .set(restImageData)
      .where(and(eq(image.id, imageId), eq(image.userId, userId)))
      .returning()
      .get();

    if (!imageResult) {
      return {
        success: false,
        error: { message: "画像が見つからないか、編集する権限がありません" },
      };
    }

    // タグが指定されていない場合は既存のタグを全て削除して終了
    if (!tags || tags.length === 0) {
      await db.delete(imageTag).where(eq(imageTag.imageId, imageId));

      return {
        success: true,
        data: {
          ...imageResult,
          tags: [],
        },
      };
    }

    const [_deleteResult, insertTagResults] = await db.batch([
      // 既存のタグとの関連を全て削除
      db
        .delete(imageTag)
        .where(eq(imageTag.imageId, imageId)),
      // タグを登録
      db
        .insert(tag)
        .values(tags.map((name) => ({ userId: imageResult.userId, name })))
        .onConflictDoUpdate({
          target: [tag.userId, tag.name],
          set: { name: sql`excluded.name` }, // 既にあるタグも取得したいので
        })
        .returning(),
    ]);

    // 画像とタグの関連付け
    if (insertTagResults.length > 0) {
      await db.insert(imageTag).values(
        insertTagResults.map((tag) => ({
          imageId,
          tagId: tag.id,
        })),
      );
    }

    return {
      success: true,
      data: {
        ...imageResult,
        tags: insertTagResults,
      },
    };
  } catch (error) {
    return createDBActionError("画像情報の更新に失敗しました", error);
  }
}

/**
 * 画像を表示・非表示を更新
 * @param dbInstance D1インスタンス
 * @param imageId 画像ID
 * @returns 更新結果
 */
export async function updateImageHidden(
  dbInstance: AnyD1Database,
  imageId: string,
  isHidden: boolean,
): Promise<ActionResult<Image>> {
  try {
    const db = getDB(dbInstance);
    const hiddenAt = isHidden ? new Date() : null;

    const result = await db.update(image).set({ hiddenAt }).where(eq(image.id, imageId)).returning().get();

    if (!result) {
      return {
        success: false,
        error: { message: "画像が見つかりません" },
      };
    }

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return createDBActionError("画像の表示・非表示の更新に失敗しました", error);
  }
}
