import { env, waitUntil } from "cloudflare:workers";
import { createServerFn } from "@tanstack/react-start";
import { nanoid } from "nanoid";
import * as v from "valibot";
import { ERROR_MESSAGE } from "@/constants/error";
import { requireAuth } from "@/features/auth/libs/auth";
import {
  deleteModerationMarker,
  deleteTempImage,
  getModerationMarker,
  headTempImage,
  uploadTempImage,
} from "@/libs/r2";
import type { UploadJobMessage } from "@/types/upload";
import { UPLOAD_ERROR_MESSAGE } from "../constants/error";
import { getImageDimensions } from "../libs/image";
import { checkUploadLimit } from "../libs/upload-limit";
import { deleteTempImageServerSchema, uploadTempImageServerSchema } from "../schemas/upload";

type UploadTempResult =
  | {
      success: true;
      tempImageId: string;
    }
  | {
      success: false;
      error: string;
    };

/**
 * ファイル選択直後に画像を一時バケットへ先行アップロードする
 *
 * フォーム入力中に転送を済ませることで、投稿時の待ち時間を短縮するのが目的。
 * 投稿されずに放置されたオブジェクトはR2のライフサイクルルールで自動削除される
 */
export const uploadTempFn = createServerFn({ method: "POST" })
  .inputValidator((data) => {
    if (!(data instanceof FormData)) {
      throw new Error("FormData is required");
    }

    const result = v.safeParse(uploadTempImageServerSchema, {
      file: data.get("file"),
    });

    if (!result.success) {
      const firstError = result.issues[0]?.message ?? ERROR_MESSAGE.VALIDATION_FAILED;
      throw new Error(firstError);
    }

    return result.output;
  })
  .handler(async ({ data }): Promise<UploadTempResult> => {
    const { session } = await requireAuth();
    const userId = session.user.id;

    const { success } = await env.ACTIONS_RATE_LIMITER.limit({
      key: `upload-temp:${userId}`,
    });

    if (!success) {
      return {
        success: false,
        error: ERROR_MESSAGE.RATE_LIMIT_EXCEEDED,
      };
    }

    // 上限到達ユーザーによる一時バケットへの保存を防ぐ（投稿可否の最終判定はuploadFn側で行う）
    const limitResult = await checkUploadLimit(userId);

    if (!limitResult.allowed) {
      return {
        success: false,
        error: limitResult.error,
      };
    }

    // クライアントの申告値は信用せず、アップロードされたバイト列から寸法を取得する
    let dimensions: { width: number; height: number };
    try {
      const arrayBuffer = await data.file.arrayBuffer();
      dimensions = getImageDimensions(arrayBuffer);
    } catch (error) {
      console.error("[upload-temp] Failed to get image dimensions:", error);

      return {
        success: false,
        error: UPLOAD_ERROR_MESSAGE.IMAGE_CONVERSION_FAILED,
      };
    }

    const tempImageId = nanoid();

    try {
      await uploadTempImage(env.TEMP_R2_BUCKET, {
        imageId: tempImageId,
        file: data.file,
        metadata: {
          userId,
          ...dimensions,
        },
      });
    } catch (error) {
      console.error("[upload-temp] Failed to upload temp image:", error);

      return {
        success: false,
        error: UPLOAD_ERROR_MESSAGE.IMAGE_UPLOAD_FAILED,
      };
    }

    // 違反コンテンツを本番バケットに乗せる前に判定するため、temp保存直後にモデレーションをトリガーする
    // 送信失敗はログのみ（publish側インラインモデレーションが安全網になる）
    const moderateJob: UploadJobMessage = { type: "moderate", tempImageId, userId };
    waitUntil(
      env.UPLOAD_QUEUE.send(moderateJob).catch((error) => {
        console.error("[upload-temp] Failed to enqueue moderation job:", error);
      }),
    );

    return {
      success: true,
      tempImageId,
    };
  });

type GetTempModerationResult = {
  status: "pending" | "ok" | "flagged";
};

/**
 * 先行アップロード済み画像のモデレーション判定状況を取得する
 *
 * フォーム表示中に違反を検知してエラー表示するために使う（読み取り専用のためレート制限は不要）。
 * 他ユーザーのtempImageIdで違反情報を漏らさないよう、マーカーのuserIdを照合する
 */
export const getTempModerationFn = createServerFn({ method: "POST" })
  .inputValidator(deleteTempImageServerSchema)
  .handler(async ({ data }): Promise<GetTempModerationResult> => {
    const { session } = await requireAuth();
    const userId = session.user.id;

    const marker = await getModerationMarker(env.TEMP_R2_BUCKET, data.tempImageId);

    // 未判定、または所有者不一致のマーカーは判定情報を出さず保留扱いにする
    if (!marker || marker.userId !== userId) {
      return { status: "pending" };
    }

    return { status: marker.flagged ? "flagged" : "ok" };
  });

/**
 * 一時バケットの画像を削除する（ファイル差し替え・投稿せず閉じた場合のクリーンアップ用）
 *
 * 呼び出し漏れや失敗はライフサイクルルールが回収するため、ベストエフォートでよい
 */
export const deleteTempFn = createServerFn({ method: "POST" })
  .inputValidator(deleteTempImageServerSchema)
  .handler(async ({ data }): Promise<{ success: boolean }> => {
    const { session } = await requireAuth();
    const userId = session.user.id;

    // 他ユーザーのオブジェクトを削除できないように所有権を照合する
    const metadata = await headTempImage(env.TEMP_R2_BUCKET, data.tempImageId, userId);

    if (!metadata) {
      return { success: false };
    }

    // 本体と一緒にモデレーションマーカーも回収する（残しても害はないがlifecycle前に掃除する）
    await Promise.all([
      deleteTempImage(env.TEMP_R2_BUCKET, data.tempImageId),
      deleteModerationMarker(env.TEMP_R2_BUCKET, data.tempImageId),
    ]);

    return { success: true };
  });
