import { env } from "cloudflare:workers";
import {
  type ActionResult,
  createDBActionError,
  fetchRandomImagesByTagId,
  fetchRandomImagesByUserId,
  type ImageWithTags,
} from "@katasu.me/service-db";
import { ERROR_MESSAGE } from "../constants/error";

export type FetchRandomImagesOptions =
  | {
      type: "user";
      userId: string;
    }
  | {
      type: "tag";
      tagId: string;
    };

/**
 * ランダムな画像を取得
 * @param options 取得オプション
 * @returns 取得結果
 */
export async function fetchRandomImages(options: FetchRandomImagesOptions): Promise<ActionResult<ImageWithTags[]>> {
  // レートリミット
  const rateLimiterKey = options.type === "user" ? options.userId : options.tagId;
  const { success } = await env.ACTIONS_RATE_LIMITER.limit({
    key: `fetchRandomImages:${rateLimiterKey}`,
  });

  if (!success) {
    return createDBActionError(ERROR_MESSAGE.RATE_LIMIT_EXCEEDED);
  }

  try {
    const result =
      options.type === "user"
        ? await fetchRandomImagesByUserId(env.DB, options.userId)
        : await fetchRandomImagesByTagId(env.DB, options.tagId);

    if (!result.success) {
      return result;
    }

    return result;
  } catch (error) {
    return createDBActionError(ERROR_MESSAGE.IMAGE_FETCH_FAILED, error);
  }
}
