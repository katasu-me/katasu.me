import { env, waitUntil } from "cloudflare:workers";
import { deleteImage, registerImage } from "@katasu.me/service-db";
import { createServerFn } from "@tanstack/react-start";
import { ERROR_MESSAGE } from "@/constants/error";
import { requireAuth } from "@/features/auth/libs/auth";
import { CACHE_KEYS, invalidateCaches } from "@/libs/cache";
import { getModerationMarker, headTempImage } from "@/libs/r2";
import { getThumbHashHSL } from "@/libs/thumbhash";
import type { UploadJobMessage } from "@/types/upload";
import { UPLOAD_ERROR_MESSAGE } from "../constants/error";
import { checkUploadLimit } from "../libs/upload-limit";
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
  .validator(uploadImageServerSchema)
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
    const limitResult = await checkUploadLimit(userId);

    if (!limitResult.allowed) {
      return {
        success: false,
        error: limitResult.error,
      };
    }

    // headより先にマーカーを確認する。違反時はtemp本体が削除済みのため、head先行だと
    // TEMP_IMAGE_NOT_FOUNDに化けてクライアントが無駄な再アップロードをしてしまう
    const moderationMarker = await getModerationMarker(env.TEMP_R2_BUCKET, data.tempImageId);

    if (moderationMarker?.flagged && moderationMarker.userId === userId) {
      return {
        success: false,
        error: UPLOAD_ERROR_MESSAGE.IMAGE_MODERATION_FLAGGED,
      };
    }

    // 画像本体はuploadTempFnで先行アップロード済み。存在・所有権・寸法をメタデータで検証する
    const tempImageMetadata = await headTempImage(env.TEMP_R2_BUCKET, data.tempImageId, userId);

    if (!tempImageMetadata) {
      return {
        success: false,
        error: UPLOAD_ERROR_MESSAGE.TEMP_IMAGE_NOT_FOUND,
      };
    }

    const imageId = data.tempImageId;

    // ThumbHashから平均色のHSL値を計算
    const avgColor = data.thumbhash ? getThumbHashHSL(data.thumbhash) : null;

    // DBに画像を登録
    const registerResult = await registerImage(env.DB, userId, {
      id: imageId,
      width: tempImageMetadata.width,
      height: tempImageMetadata.height,
      title: data.title ?? null,
      thumbhash: data.thumbhash,
      avgColorH: avgColor?.h ?? null,
      avgColorS: avgColor?.s ?? null,
      avgColorL: avgColor?.l ?? null,
      tags: data.tags,
    });

    if (!registerResult.success) {
      console.error("[gallery] Image registration to DB failed:", registerResult.error);

      // 一時ファイルは削除しない（再送信で再利用できる。放置されてもライフサイクルルールが回収する）
      return {
        success: false,
        error: UPLOAD_ERROR_MESSAGE.IMAGE_REGISTER_FAILED,
      };
    }

    // Queue投入はレスポンス前に完了させる。失敗するとDBは'processing'のまま公開されないため、
    // エラー時はDBステータスを'error'に戻してクライアントにエラーを返す
    const uploadJob: UploadJobMessage = {
      type: "publish",
      imageId,
      userId,
    };

    try {
      await env.UPLOAD_QUEUE.send(uploadJob);
    } catch (error) {
      console.error("[gallery] Failed to enqueue publish job:", error);
      // DB行を削除して同じtempImageIdでの再送を可能にする
      try {
        await deleteImage(env.DB, imageId, userId);
      } catch (deleteError) {
        console.error("[gallery] Failed to rollback image registration:", deleteError);
      }
      return {
        success: false,
        error: UPLOAD_ERROR_MESSAGE.IMAGE_ENQUEUE_FAILED,
      };
    }

    // タグ一覧のKVキャッシュ無効化は非クリティカルなためwaitUntilで行う
    if (registerResult.data?.tags) {
      waitUntil(
        invalidateCaches(env.CACHE_KV, [CACHE_KEYS.userTagsByUsage(userId), CACHE_KEYS.userTagsByName(userId)]),
      );
    }

    return {
      success: true,
      imageId,
    };
  });
