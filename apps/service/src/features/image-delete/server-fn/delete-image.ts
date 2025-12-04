import { env } from "cloudflare:workers";
import { deleteImage } from "@katasu.me/service-db";
import { createServerFn } from "@tanstack/react-start";
import { object, string } from "valibot";
import { ERROR_MESSAGE } from "@/constants/error";
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
      const { session } = await requireAuth();

      const { success: rateLimitSuccess } = await env.ACTIONS_RATE_LIMITER.limit({
        key: `delete:${session.user.id}`,
      });

      if (!rateLimitSuccess) {
        return {
          success: false,
          error: ERROR_MESSAGE.RATE_LIMIT_EXCEEDED,
        };
      }

      // DBから画像を削除
      const deleteResult = await deleteImage(env.DB, imageId, session.user.id);

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

      // タグ一覧のKVキャッシュを無効化
      await invalidateCaches(env.CACHE_KV, [CACHE_KEYS.userTagsByUsage(userId), CACHE_KEYS.userTagsByName(userId)]);

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
