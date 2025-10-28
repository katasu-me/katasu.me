"use server";

import {
  type ActionResult,
  fetchRandomImagesByTagId,
  fetchRandomImagesByUserId,
  type ImageWithTags,
} from "@katasu.me/service-db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { FetchRandomImagesOptions } from "../_types/fetch-random-images";

/**
 * ランダムな画像を取得
 * @param options 取得オプション
 * @returns 取得結果
 */
export async function fetchRandomImages(options: FetchRandomImagesOptions): Promise<ActionResult<ImageWithTags[]>> {
  const { env } = getCloudflareContext();

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
        message: "画像の取得中にエラーが発生しました",
        rawError: error,
      },
    };
  }
}
