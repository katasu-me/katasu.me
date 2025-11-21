import { env } from "cloudflare:workers";
import { fetchImageById, updateImage } from "@katasu.me/service-db";
import { createServerFn } from "@tanstack/react-start";
import { object, optional, safeParse, string } from "valibot";
import { requireAuth } from "@/features/auth/libs/auth";
import { CACHE_KEYS, invalidateCaches } from "@/libs/cache";
import { editImageSchema } from "../schemas/edit";

const EditImageInputSchema = object({
  imageId: string(),
  title: optional(string()),
  tags: optional(string()), // JSON文字列
});

type EditImageResult =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    };

/**
 * 画像情報を編集する
 */
export const editImageFn = createServerFn({ method: "POST" })
  .inputValidator(EditImageInputSchema)
  .handler(async ({ data }): Promise<EditImageResult> => {
    try {
      // 認証チェック
      const { session } = await requireAuth();
      const userId = session.user.id;

      // タグをパース
      let tags: string[] | undefined;
      if (data.tags) {
        try {
          tags = JSON.parse(data.tags);
        } catch {
          return {
            success: false,
            error: "タグの形式が不正です",
          };
        }
      }

      // バリデーション
      const validationResult = safeParse(editImageSchema, {
        imageId: data.imageId,
        title: data.title,
        tags,
      });

      if (!validationResult.success) {
        const firstIssue = validationResult.issues[0];
        return {
          success: false,
          error: firstIssue?.message ?? "入力値が不正です",
        };
      }

      const { imageId, title, tags: validatedTags } = validationResult.output;

      // 画像を取得
      const fetchImageResult = await fetchImageById(env.DB, imageId);

      if (!fetchImageResult.success) {
        return {
          success: false,
          error: "画像の取得に失敗しました",
        };
      }

      const prevImageData = fetchImageResult.data;

      if (!prevImageData) {
        return {
          success: false,
          error: "画像が存在しません",
        };
      }

      if (prevImageData.userId !== userId) {
        return {
          success: false,
          error: "権限がありません",
        };
      }

      // 画像情報を更新
      const updateImageResult = await updateImage(env.DB, imageId, {
        title: title ?? null,
        tags: validatedTags ?? [],
      });

      if (!updateImageResult.success) {
        console.error("[edit] 画像情報の更新に失敗しました:", updateImageResult.error);

        return {
          success: false,
          error: updateImageResult.error.message,
        };
      }

      // キャッシュを無効化
      const keysToInvalidate = [
        CACHE_KEYS.imageDetail(imageId), // 画像詳細
      ];

      const prevTags = prevImageData.tags || [];
      const prevTagIds = new Set(prevTags.map((t) => t.id));

      const newTags = updateImageResult.data?.tags || [];
      const newTagIds = new Set(newTags.map((t) => t.id));

      // タグに変更があった場合、タグ一覧も無効化
      const tagsChanged = prevTags.length !== newTags.length || prevTags.some((tag) => !newTagIds.has(tag.id));
      if (tagsChanged) {
        keysToInvalidate.push(CACHE_KEYS.userTagsByUsage(userId), CACHE_KEYS.userTagsByName(userId));
      }

      // 削除されたタグ
      for (const tag of prevTags) {
        if (!newTagIds.has(tag.id)) {
          keysToInvalidate.push(CACHE_KEYS.tagImages(tag.id));
        }
      }

      // 追加されたタグ
      for (const tag of newTags) {
        if (!prevTagIds.has(tag.id)) {
          keysToInvalidate.push(CACHE_KEYS.tagImages(tag.id));
        }
      }

      await invalidateCaches(env.CACHE_KV, keysToInvalidate);

      return {
        success: true,
      };
    } catch (error) {
      console.error("[edit] 画像情報の更新に失敗しました:", error);

      return {
        success: false,
        error: error instanceof Error ? error.message : "画像情報の更新に失敗しました",
      };
    }
  });
