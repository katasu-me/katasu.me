import { env, waitUntil } from "cloudflare:workers";
import { fetchUserImageStatus, registerImage } from "@katasu.me/service-db";
import { createServerFn } from "@tanstack/react-start";
import { nanoid } from "nanoid";
import * as v from "valibot";
import { requireAuth } from "@/features/auth/libs/auth";
import { CACHE_KEYS, invalidateCaches } from "@/libs/cache";
import { createImageUploadPromises, generateR2Key } from "@/libs/r2";
import { ERROR_MESSAGE } from "../constants/error";
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

    const payload = {
      file,
      title: title || undefined,
      tags: tagsJson ? JSON.parse(tagsJson as string) : undefined,
    };

    const result = v.safeParse(uploadImageSchema, payload);

    if (!result.success) {
      const firstError = result.issues[0]?.message ?? "Validation error";
      throw new Error(firstError);
    }

    return result.output;
  })
  .handler(async ({ data }): Promise<UploadResult> => {
    const totalStart = performance.now();
    const timings: Record<string, number> = {};

    let start = performance.now();
    const { session } = await requireAuth();
    timings.requireAuth = performance.now() - start;

    start = performance.now();
    const { success } = await env.ACTIONS_RATE_LIMITER.limit({
      key: `upload:${session.user.id}`,
    });
    timings.rateLimiter = performance.now() - start;

    if (!success) {
      return {
        success: false,
        error: ERROR_MESSAGE.RATE_LIMIT_EXCEEDED,
      };
    }

    const userId = session.user.id;

    start = performance.now();
    const userImageStatusResult = await fetchUserImageStatus(env.DB, userId);
    timings.fetchUserImageStatus = performance.now() - start;

    if (!userImageStatusResult.success || !userImageStatusResult.data) {
      return {
        success: false,
        error: ERROR_MESSAGE.USER_UNAUTHORIZED,
      };
    }

    if (userImageStatusResult.data.uploadedPhotos >= userImageStatusResult.data.maxPhotos) {
      return {
        success: false,
        error: ERROR_MESSAGE.IMAGE_UPLOAD_LIMIT_EXCEEDED,
      };
    }

    const imageId = nanoid();

    const originalKey = generateR2Key("image", userId, imageId, "original");

    start = performance.now();
    const existingOriginal = await env.IMAGES_R2_BUCKET.head(originalKey);
    timings.checkDuplicate = performance.now() - start;

    if (existingOriginal) {
      console.error("[gallery] Image ID duplicated:", { userId, imageId });

      return {
        success: false,
        error: ERROR_MESSAGE.IMAGE_ID_DUPLICATE,
      };
    }

    if (!data.file) {
      return {
        success: false,
        error: ERROR_MESSAGE.EMPTY_IMAGE,
      };
    }

    let convertResult: Awaited<ReturnType<typeof generateImageVariants>>;

    try {
      start = performance.now();
      const arrayBuffer = await data.file.arrayBuffer();
      timings.fileToArrayBuffer = performance.now() - start;

      start = performance.now();
      const originalImageDimensions = getImageDimensions(arrayBuffer);
      timings.getImageDimensions = performance.now() - start;

      start = performance.now();
      convertResult = await generateImageVariants(arrayBuffer, {
        originalWidth: originalImageDimensions.width,
        originalHeight: originalImageDimensions.height,
      });
      timings.generateImageVariants = performance.now() - start;
    } catch (error) {
      console.error("[gallery] Image conversion failed:", error);

      const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGE.IMAGE_CONVERSION_FAILED;

      return {
        success: false,
        error: errorMessage,
      };
    }

    // R2アップロードとDB登録を並列実行
    start = performance.now();
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
    timings.parallelOperations = performance.now() - start;

    // エラーハンドリング
    if (originalResult.status === "rejected" || thumbnailResult.status === "rejected") {
      console.error("[gallery] Image upload failed:", {
        original: originalResult.status === "rejected" ? originalResult.reason : "ok",
        thumbnail: thumbnailResult.status === "rejected" ? thumbnailResult.reason : "ok",
      });

      return {
        success: false,
        error: ERROR_MESSAGE.IMAGE_UPLOAD_FAILED,
      };
    }

    if (registerResult.status === "rejected" || !registerResult.value.success) {
      const error = registerResult.status === "rejected" ? registerResult.reason : registerResult.value.error;
      console.error("[gallery] Image registration to DB failed:", error);

      return {
        success: false,
        error: ERROR_MESSAGE.IMAGE_REGISTER_FAILED,
      };
    }

    const registerImageResult = registerResult.value;

    // タグ一覧のKVキャッシュを無効化
    if (registerImageResult.data?.tags) {
      waitUntil(
        invalidateCaches(env.CACHE_KV, [CACHE_KEYS.userTagsByUsage(userId), CACHE_KEYS.userTagsByName(userId)]),
      );
    }

    timings.total = performance.now() - totalStart;

    console.log("[gallery] Upload timings (ms):", timings);

    return {
      success: true,
      imageId,
    };
  });
