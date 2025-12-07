import { env } from "cloudflare:workers";
import { fetchImagesByUserId, fetchTagsByUserId, fetchTotalImageCountByUserId } from "@katasu.me/service-db";
import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { type InferInput, number, object, string } from "valibot";
import { getUserSession } from "../../auth/libs/auth";
import { GALLERY_PAGE_SIZE } from "../constants/page";
import { GalleryViewSchema } from "../schemas/view";
import { fetchRandomImagesFn } from "./fetch-random";

const fetchTagsByUsage = async (userId: string) => {
  const result = await fetchTagsByUserId(env.DB, userId, {
    order: "usage",
  });

  if (!result.success || result.data.length <= 0) {
    return;
  }

  return result.data;
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

    const { session } = await getUserSession();
    const isOwner = session?.user?.id === userId;

    // ランダムビューの場合
    if (view === "random") {
      const [tags, images] = await Promise.all([
        fetchTagsByUsage(userId),
        fetchRandomImagesFn({ data: { type: "user", userId } }),
      ]);

      return {
        tags,
        images,
      };
    }

    // タイムラインビューの場合
    const totalImageCountResult = await fetchTotalImageCountByUserId(env.DB, userId);
    const totalImageCount = totalImageCountResult.success ? totalImageCountResult.data : 0;

    const rawOffset = GALLERY_PAGE_SIZE * (page - 1);
    const offset = totalImageCount < rawOffset ? 0 : rawOffset;

    const [tags, imagesResult] = await Promise.all([
      fetchTagsByUsage(userId),
      fetchImagesByUserId(env.DB, userId, {
        offset,
        order: "desc",
        limit: GALLERY_PAGE_SIZE,
        includeViolation: isOwner,
      }),
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
