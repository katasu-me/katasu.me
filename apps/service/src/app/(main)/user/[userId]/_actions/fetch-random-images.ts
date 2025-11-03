"use server";

import {
  type ActionResult,
  fetchRandomImagesByTagId,
  fetchRandomImagesByUserId,
  type ImageWithTags,
} from "@katasu.me/service-db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ERROR_MESSAGES } from "../_constants/error-messages";
import type { FetchRandomImagesOptions } from "../_types/fetch-random-images";

/**
 * ランダムな画像を取得
 * @param options 取得オプション
 * @returns 取得結果
 */
export async function fetchRandomImages(options: FetchRandomImagesOptions): Promise<ActionResult<ImageWithTags[]>> {
  const { env } = getCloudflareContext();

  // レートリミット
  const rateLimiterKey = options.type === "user" ? options.userId : options.tagId;
  const { success } = await env.ACTIONS_RATE_LIMITER.limit({
    key: `fetchRandomImages:${rateLimiterKey}`,
  });

  if (!success) {
    return {
      success: false,
      error: {
        message: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
      },
    };
  }

  try {
    const result =
      options.type === "user"
        ? await fetchRandomImagesByUserId(env.DB, options.userId)
        : await fetchRandomImagesByTagId(env.DB, options.tagId);

    if (!result.success) {
      console.error("[fetchRandomImages] 画像の取得に失敗しました:", result.error);
      return result;
    }

    return result;
  } catch (error) {
    console.error("[fetchRandomImages] エラーが発生しました:", error);
    return {
      success: false,
      error: {
        message: ERROR_MESSAGES.IMAGE_FETCH_FAILED,
        rawError: error,
      },
    };
  }
}
