import { env, waitUntil } from "cloudflare:workers";
import { fetchUserImageStatus, registerImage } from "@katasu.me/service-db";
import { createServerFn } from "@tanstack/react-start";
import { nanoid } from "nanoid";
import * as v from "valibot";
import { ERROR_MESSAGE } from "@/constants/error";
import { requireAuth } from "@/features/auth/libs/auth";
import { CACHE_KEYS, invalidateCaches } from "@/libs/cache";
import { createImageUploadPromises, generateR2Key, getImageUrl } from "@/libs/r2";
import type { ModerationJobMessage } from "@/types/moderation";
import { UPLOAD_ERROR_MESSAGE } from "../constants/error";
import { generateImageVariants, getImageDimensions } from "../libs/image";
import { uploadImageSchema } from "../schemas/upload";

type UploadResult =
  | {
      success: true;
      imageId: string;
    }
  | {
      success: false;
      error: string;
    };

export const uploadFn = createServerFn({ method: "POST" })
  .inputValidator((data) => {
    if (!(data instanceof FormData)) {
      throw new Error("FormData is required");
    }

    const file = data.get("file");
    const title = data.get("title");
    const tagsJson = data.get("tags");

    let tags: string[] | undefined;
    if (tagsJson) {
      try {
        tags = JSON.parse(tagsJson as string);
      } catch {
        throw new Error("タグの形式が不正です");
      }
    }

    const payload = {
      file,
      title: title || undefined,
      tags,
    };

    const result = v.safeParse(uploadImageSchema, payload);

    if (!result.success) {
      const firstError = result.issues[0]?.message ?? ERROR_MESSAGE.VALIDATION_FAILED;
      throw new Error(firstError);
    }

    return result.output;
  })
  .handler(async ({ data }): Promise<UploadResult> => {
    const { session } = await requireAuth();

    const { success } = await env.ACTIONS_RATE_LIMITER.limit({
      key: `upload:${session.user.id}`,
    });

    if (!success) {
      return {
        success: false,
        error: ERROR_MESSAGE.RATE_LIMIT_EXCEEDED,
      };
    }

    const userId = session.user.id;
    const userImageStatusResult = await fetchUserImageStatus(env.DB, userId);

    if (!userImageStatusResult.success || !userImageStatusResult.data) {
      return {
        success: false,
        error: UPLOAD_ERROR_MESSAGE.USER_UNAUTHORIZED,
      };
    }

    if (userImageStatusResult.data.uploadedPhotos >= userImageStatusResult.data.maxPhotos) {
      return {
        success: false,
        error: UPLOAD_ERROR_MESSAGE.IMAGE_UPLOAD_LIMIT_EXCEEDED,
      };
    }

    const imageId = nanoid();
    const originalKey = generateR2Key("image", userId, imageId, "original");
    const existingOriginal = await env.IMAGES_R2_BUCKET.head(originalKey);

    if (existingOriginal) {
      console.error("[gallery] Image ID duplicated:", { userId, imageId });

      return {
        success: false,
        error: UPLOAD_ERROR_MESSAGE.IMAGE_ID_DUPLICATE,
      };
    }

    if (!data.file) {
      return {
        success: false,
        error: UPLOAD_ERROR_MESSAGE.EMPTY_IMAGE,
      };
    }

    let convertResult: Awaited<ReturnType<typeof generateImageVariants>>;

    try {
      const arrayBuffer = await data.file.arrayBuffer();
      const originalImageDimensions = getImageDimensions(arrayBuffer);

      convertResult = await generateImageVariants(arrayBuffer, {
        originalWidth: originalImageDimensions.width,
        originalHeight: originalImageDimensions.height,
      });
    } catch (error) {
      console.error("[gallery] Image conversion failed:", error);

      const errorMessage = error instanceof Error ? error.message : UPLOAD_ERROR_MESSAGE.IMAGE_CONVERSION_FAILED;

      return {
        success: false,
        error: errorMessage,
      };
    }

    const [originalUploadPromise, thumbnailUploadPromise] = createImageUploadPromises(env.IMAGES_R2_BUCKET, {
      type: "image",
      variants: convertResult,
      userId,
      imageId,
    });

    const registerImagePromise = registerImage(env.DB, session.user.id, {
      ...convertResult.dimensions,
      id: imageId,
      title: data.title ?? null,
      tags: data.tags,
    });

    const [originalResult, thumbnailResult, registerResult] = await Promise.allSettled([
      originalUploadPromise,
      thumbnailUploadPromise,
      registerImagePromise,
    ]);

    // アップロードのエラーハンドリング
    if (originalResult.status === "rejected" || thumbnailResult.status === "rejected") {
      console.error("[gallery] Image upload failed:", {
        original: originalResult.status === "rejected" ? originalResult.reason : "ok",
        thumbnail: thumbnailResult.status === "rejected" ? thumbnailResult.reason : "ok",
      });

      return {
        success: false,
        error: UPLOAD_ERROR_MESSAGE.IMAGE_UPLOAD_FAILED,
      };
    }

    // 画像の登録のエラーハンドリング
    if (registerResult.status === "rejected" || !registerResult.value.success) {
      const error =
        registerResult.status === "rejected"
          ? registerResult.reason
          : !registerResult.value.success
            ? registerResult.value.error
            : null;

      console.error("[gallery] Image registration to DB failed:", error);

      return {
        success: false,
        error: UPLOAD_ERROR_MESSAGE.IMAGE_REGISTER_FAILED,
      };
    }

    const registerImageResult = registerResult.value;

    // モデレーションジョブをQueueに投入
    const moderationJob: ModerationJobMessage = {
      imageId,
      userId,
      imageUrl: getImageUrl(userId, imageId, "original"),
    };

    console.log("[gallery] Enqueue moderation job:", { imageId, userId });

    waitUntil(
      Promise.all([
        env.MODERATION_QUEUE.send(moderationJob),
        // タグ一覧のKVキャッシュを無効化
        registerImageResult.data?.tags
          ? invalidateCaches(env.CACHE_KV, [CACHE_KEYS.userTagsByUsage(userId), CACHE_KEYS.userTagsByName(userId)])
          : Promise.resolve(),
      ]),
    );

    return {
      success: true,
      imageId,
    };
  });
