import { env } from "cloudflare:workers";
import { deleteImage, fetchImageById } from "@katasu.me/service-db";
import { createServerFn } from "@tanstack/react-start";
import { object, string } from "valibot";
import { requireAuth } from "@/features/auth/libs/auth";
import { CACHE_KEYS, invalidateCaches } from "@/libs/cache";
import { deleteImageFromR2 } from "@/libs/r2";

const DeleteImageInputSchema = object({
  userId: string(),
  imageId: string(),
});

type DeleteImageResult =
  | {
      success: true;
      redirectTo: string;
    }
  | {
      success: false;
      error: string;
    };

export const deleteImageFn = createServerFn({ method: "POST" })
  .inputValidator(DeleteImageInputSchema)
  .handler(async ({ data }): Promise<DeleteImageResult> => {
    const { userId, imageId } = data;

    try {
      // 認証チェック
      const { session } = await requireAuth();

      // 画像を取得
      const fetchImageResult = await fetchImageById(env.DB, imageId);

      if (!fetchImageResult.success) {
        return {
          success: false,
          error: "画像が見つかりません",
        };
      }

      const prevImageData = fetchImageResult.data;

      if (!prevImageData) {
        return {
          success: false,
          error: "画像が見つかりません",
        };
      }

      // 編集する権限があるか
      if (prevImageData.userId !== session.user.id) {
        return {
          success: false,
          error: "権限がありません",
        };
      }

      // DBから画像を削除
      const deleteResult = await deleteImage(env.DB, imageId);

      if (!deleteResult.success) {
        console.error("[delete] DBから画像を削除できませんでした:", deleteResult.error);
        return {
          success: false,
          error: deleteResult.error.message,
        };
      }

      // R2から画像を削除
      try {
        await deleteImageFromR2(env.IMAGES_R2_BUCKET, userId, imageId);
      } catch (error) {
        console.error("[delete] R2から画像を削除できませんでした:", error);

        return {
          success: false,
          error: error instanceof Error ? error.message : "不明なエラーでR2からの削除に失敗しました",
        };
      }

      // キャッシュを無効化
      const keysToInvalidate = [
        CACHE_KEYS.imageDetail(imageId), // 画像詳細
        CACHE_KEYS.userImages(userId), // ユーザーの画像一覧
        CACHE_KEYS.userImageCount(userId), // ユーザーの総画像数
      ];

      // タグに変更がある場合
      if (prevImageData.tags.length !== 0) {
        // タグ一覧
        keysToInvalidate.push(CACHE_KEYS.userTagsByUsage(userId), CACHE_KEYS.userTagsByName(userId));

        // 削除された画像のタグ別画像一覧
        for (const tag of prevImageData.tags) {
          keysToInvalidate.push(CACHE_KEYS.tagImages(tag.id));
        }
      }

      await invalidateCaches(env.CACHE_KV, keysToInvalidate);

      return {
        success: true,
        redirectTo: `/user/${userId}`,
      };
    } catch (error) {
      console.error("[delete] 画像の削除に失敗しました:", error);

      return {
        success: false,
        error: error instanceof Error ? error.message : "画像の削除に失敗しました",
      };
    }
  });
