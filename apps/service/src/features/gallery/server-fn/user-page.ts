import { env } from "cloudflare:workers";
import { fetchImagesByUserId, fetchTagsByUserId } from "@katasu.me/service-db";
import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { type InferInput, number, object, string } from "valibot";
import { CACHE_KEYS, getCached } from "@/libs/cache";
import { GALLERY_PAGE_SIZE } from "../constants/page";
import { cachedFetchTotalImageCount } from "../libs/cached-image-count";
import { GalleryViewSchema } from "../schemas/view";
import { fetchRandomImagesFn } from "./fetch-random";

const cachedFetchTagsByUsage = async (userId: string) => {
  const key = CACHE_KEYS.userTagsByUsage(userId);

  const result = await getCached(env.CACHE_KV, key, async () => {
    return fetchTagsByUserId(env.DB, userId, {
      order: "usage",
    });
  });

  if (!result.success || result.data.length <= 0) {
    return;
  }

  return result.data;
};

const cachedFetchImagesByUserId = async (userId: string, offset: number) => {
  const key = CACHE_KEYS.userImages(userId);

  return getCached(env.CACHE_KV, key, async () => {
    return fetchImagesByUserId(env.DB, userId, {
      offset,
      order: "desc",
    });
  });
};

const UserPageLoaderInputSchema = object({
  view: GalleryViewSchema,
  userId: string(),
  page: number(),
});

const userPageLoaderFn = createServerFn({ method: "GET" })
  .inputValidator(UserPageLoaderInputSchema)
  .handler(async ({ data }) => {
    const { view, userId, page } = data;

    // ランダムビューの場合
    if (view === "random") {
      const [tags, images] = await Promise.all([
        cachedFetchTagsByUsage(userId),
        fetchRandomImagesFn({ data: { type: "user", userId } }),
      ]);

      return {
        tags,
        images,
      };
    }

    // タイムラインビューの場合
    const totalImageCountResult = await cachedFetchTotalImageCount(userId);
    const totalImageCount = totalImageCountResult.success ? totalImageCountResult.data : 0;

    const rawOffset = GALLERY_PAGE_SIZE * (page - 1);
    const offset = totalImageCount < rawOffset ? 0 : rawOffset;

    const [tags, imagesResult] = await Promise.all([
      cachedFetchTagsByUsage(userId),
      cachedFetchImagesByUserId(userId, offset),
    ]);

    if (!imagesResult.success) {
      console.error("[user-page] 画像の取得に失敗しました:", imagesResult.error);
      throw new Error(imagesResult.error.message);
    }

    return {
      tags,
      images: imagesResult.data,
    };
  });

export type UserPageLoaderInput = InferInput<typeof UserPageLoaderInputSchema>;
export const USER_PAGE_QUERY_KEY = "user-page";

export const userPageQueryOptions = (input: UserPageLoaderInput) =>
  queryOptions({
    queryKey: [USER_PAGE_QUERY_KEY, input.userId, input.view, input.page],
    queryFn: () => userPageLoaderFn({ data: input }),
  });
