import { env } from "cloudflare:workers";
import { fetchImageById, updateImage } from "@katasu.me/service-db";
import { createServerFn } from "@tanstack/react-start";
import { object, optional, safeParse, string } from "valibot";
import { ERROR_MESSAGE } from "@/constants/error";
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
      const { session } = await requireAuth();
      const userId = session.user.id;

      const { success: rateLimitSuccess } = await env.ACTIONS_RATE_LIMITER.limit({
        key: `edit:${userId}`,
      });

      if (!rateLimitSuccess) {
        return {
          success: false,
          error: ERROR_MESSAGE.RATE_LIMIT_EXCEEDED,
        };
      }

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

      const validationResult = safeParse(editImageSchema, {
        imageId: data.imageId,
        title: data.title,
        tags,
      });

      if (!validationResult.success) {
        const firstIssue = validationResult.issues[0];
        return {
          success: false,
          error: firstIssue?.message ?? ERROR_MESSAGE.VALIDATION_FAILED,
        };
      }

      const { imageId, title, tags: validatedTags } = validationResult.output;

      // タグ変更の比較用に現在の画像情報を取得
      const fetchImageResult = await fetchImageById(env.DB, imageId);
      const prevTags = fetchImageResult.success ? fetchImageResult.data?.tags || [] : [];

      // 画像情報を更新
      const updateImageResult = await updateImage(env.DB, imageId, userId, {
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

      // タグ一覧のKVキャッシュを無効化
      const newTags = updateImageResult.data?.tags || [];
      const newTagIds = new Set(newTags.map((t) => t.id));

      const tagsChanged = prevTags.length !== newTags.length || prevTags.some((tag) => !newTagIds.has(tag.id));
      if (tagsChanged) {
        await invalidateCaches(env.CACHE_KV, [CACHE_KEYS.userTagsByUsage(userId), CACHE_KEYS.userTagsByName(userId)]);
      }

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
