import { env, waitUntil } from "cloudflare:workers";
import { fetchUserImageStatus, registerImage } from "@katasu.me/service-db";
import { createServerFn } from "@tanstack/react-start";
import { nanoid } from "nanoid";
import * as v from "valibot";
import { ERROR_MESSAGE } from "@/constants/error";
import { requireAuth } from "@/features/auth/libs/auth";
import { CACHE_KEYS, invalidateCaches } from "@/libs/cache";
import { uploadTempImage } from "@/libs/r2";
import { getThumbHashHSL } from "@/libs/thumbhash";
import type { UploadJobMessage } from "@/types/upload";
import { UPLOAD_ERROR_MESSAGE } from "../constants/error";
import { getImageDimensions } from "../libs/image";
import { uploadImageServerSchema } from "../schemas/upload";

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
    const thumbhash = data.get("thumbhash");

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
      thumbhash,
    };

    const result = v.safeParse(uploadImageServerSchema, payload);

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

    if (!data.file) {
      return {
        success: false,
        error: UPLOAD_ERROR_MESSAGE.EMPTY_IMAGE,
      };
    }

    // 画像のサイズを取得
    let dimensions: { width: number; height: number };
    try {
      const arrayBuffer = await data.file.arrayBuffer();
      dimensions = getImageDimensions(arrayBuffer);
    } catch (error) {
      console.error("[gallery] Failed to get image dimensions:", error);

      return {
        success: false,
        error: UPLOAD_ERROR_MESSAGE.IMAGE_CONVERSION_FAILED,
      };
    }

    const imageId = nanoid();

    // 一時バケットに画像をアップロード
    try {
      await uploadTempImage(env.TEMP_R2_BUCKET, {
        imageId,
        file: data.file,
      });
    } catch (error) {
      console.error("[gallery] Failed to upload temp image:", error);

      return {
        success: false,
        error: UPLOAD_ERROR_MESSAGE.IMAGE_UPLOAD_FAILED,
      };
    }

    // ThumbHashから平均色のHSL値を計算
    const avgColor = data.thumbhash ? getThumbHashHSL(data.thumbhash) : null;

    // DBに画像を登録
    const registerResult = await registerImage(env.DB, userId, {
      id: imageId,
      ...dimensions,
      title: data.title ?? null,
      thumbhash: data.thumbhash,
      avgColorH: avgColor?.h ?? null,
      avgColorS: avgColor?.s ?? null,
      avgColorL: avgColor?.l ?? null,
      tags: data.tags,
    });

    if (!registerResult.success) {
      console.error("[gallery] Image registration to DB failed:", registerResult.error);

      // 一時ファイルを削除（失敗しても続行）
      env.TEMP_R2_BUCKET.delete(imageId).catch(() => {});

      return {
        success: false,
        error: UPLOAD_ERROR_MESSAGE.IMAGE_REGISTER_FAILED,
      };
    }

    // アップロードジョブをQueueに投入
    const uploadJob: UploadJobMessage = {
      imageId,
      userId,
    };

    waitUntil(
      Promise.all([
        env.UPLOAD_QUEUE.send(uploadJob),
        // タグ一覧のKVキャッシュを無効化
        registerResult.data?.tags
          ? invalidateCaches(env.CACHE_KV, [CACHE_KEYS.userTagsByUsage(userId), CACHE_KEYS.userTagsByName(userId)])
          : Promise.resolve(),
      ]),
    );

    return {
      success: true,
      imageId,
    };
  });
