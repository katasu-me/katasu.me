import { env } from "cloudflare:workers";
import {
  fetchImagesByTagId,
  fetchTagById,
  fetchTagsByUserId,
  fetchTotalImageCountByTagId,
} from "@katasu.me/service-db";
import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { number, object, string } from "valibot";
import { CACHE_KEYS, getCached } from "@/libs/cache";
import { GALLERY_PAGE_SIZE } from "../constants/page";
import { GalleryViewSchema } from "../schemas/view";
import { fetchRandomImagesFn } from "./fetch-random";

const cachedFetchTagById = async (tagId: string) => {
  return fetchTagById(env.DB, tagId);
};

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

const cachedFetchImagesByTagId = async (tagId: string, offset: number) => {
  const key = CACHE_KEYS.tagImages(tagId);

  return getCached(env.CACHE_KV, key, async () => {
    return fetchImagesByTagId(env.DB, tagId, {
      offset,
      order: "desc",
    });
  });
};

const cachedFetchTotalImageCountByTagId = async (tagId: string) => {
  const key = CACHE_KEYS.tagTotalImageCount(tagId);

  return getCached(env.CACHE_KV, key, async () => {
    return fetchTotalImageCountByTagId(env.DB, tagId);
  });
};

const TagPageLoaderInputSchema = object({
  view: GalleryViewSchema,
  userId: string(),
  tagId: string(),
  page: number(),
});

export const tagPageLoaderFn = createServerFn({ method: "GET" })
  .inputValidator(TagPageLoaderInputSchema)
  .handler(async ({ data }) => {
    const { view, userId, tagId, page } = data;

    const tagResult = await cachedFetchTagById(tagId);

    if (!tagResult.success || !tagResult.data) {
      throw notFound();
    }

    if (view === "random") {
      const [tags, images] = await Promise.all([
        cachedFetchTagsByUsage(userId),
        fetchRandomImagesFn({ data: { type: "tag", tagId } }),
      ]);

      return {
        tag: tagResult.data,
        tags,
        images,
      };
    }

    const tagTotalImageCountResult = await cachedFetchTotalImageCountByTagId(tagId);

    if (!tagTotalImageCountResult.success) {
      throw new Error(tagTotalImageCountResult.error.message);
    }

    const tagTotalImageCount = tagTotalImageCountResult.data;
    const rawOffset = GALLERY_PAGE_SIZE * (page - 1);
    const offset = tagTotalImageCount < rawOffset ? 0 : rawOffset;

    const [tags, imagesResult] = await Promise.all([
      cachedFetchTagsByUsage(userId),
      cachedFetchImagesByTagId(tagId, offset),
    ]);

    if (!imagesResult.success) {
      throw new Error(imagesResult.error.message);
    }

    return {
      tag: tagResult.data,
      tags,
      images: imagesResult.data,
    };
  });
