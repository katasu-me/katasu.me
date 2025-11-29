import { env } from "cloudflare:workers";
import {
  fetchImagesByTagId,
  fetchTagById,
  fetchTagsByUserId,
  fetchTotalImageCountByTagId,
} from "@katasu.me/service-db";
import { queryOptions } from "@tanstack/react-query";
import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { type InferInput, number, object, string } from "valibot";
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

const TagPageLoaderInputSchema = object({
  view: GalleryViewSchema,
  userId: string(),
  tagId: string(),
  page: number(),
});

const tagPageLoaderFn = createServerFn({ method: "GET" })
  .inputValidator(TagPageLoaderInputSchema)
  .handler(async ({ data }) => {
    const { view, userId, tagId, page } = data;

    const tagResult = await fetchTagById(env.DB, tagId);

    if (!tagResult.success || !tagResult.data) {
      throw notFound();
    }

    if (view === "random") {
      const [tags, images] = await Promise.all([
        fetchTagsByUsage(userId),
        fetchRandomImagesFn({ data: { type: "tag", tagId } }),
      ]);

      return {
        tag: tagResult.data,
        tags,
        images,
      };
    }

    const tagTotalImageCountResult = await fetchTotalImageCountByTagId(env.DB, tagId);

    if (!tagTotalImageCountResult.success) {
      throw new Error(tagTotalImageCountResult.error.message);
    }

    const tagTotalImageCount = tagTotalImageCountResult.data;
    const rawOffset = GALLERY_PAGE_SIZE * (page - 1);
    const offset = tagTotalImageCount < rawOffset ? 0 : rawOffset;

    const [tags, imagesResult] = await Promise.all([
      fetchTagsByUsage(userId),
      fetchImagesByTagId(env.DB, tagId, {
        offset,
        order: "desc",
        limit: GALLERY_PAGE_SIZE,
      }),
    ]);

    if (!imagesResult.success) {
      throw new Error(imagesResult.error.message);
    }

    return {
      tag: tagResult.data,
      tags,
      images: imagesResult.data,
      tagTotalImageCount,
    };
  });

export type TagPageLoaderInput = InferInput<typeof TagPageLoaderInputSchema>;
export const TAG_PAGE_QUERY_KEY = "tag-page";

export const tagPageQueryOptions = (input: TagPageLoaderInput) =>
  queryOptions({
    queryKey: [TAG_PAGE_QUERY_KEY, input.userId, input.tagId, input.view, input.page],
    queryFn: () => tagPageLoaderFn({ data: input }),
  });
