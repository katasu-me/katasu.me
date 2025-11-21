import { env } from "cloudflare:workers";
import { fetchImageById } from "@katasu.me/service-db";
import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { object, string } from "valibot";
import { CACHE_KEYS, getCached } from "@/libs/cache";

const cachedFetchImageById = async (imageId: string) => {
  return getCached(env.CACHE_KV, CACHE_KEYS.imageDetail(imageId), async () => {
    return await fetchImageById(env.DB, imageId);
  });
};

const ImagePageLoaderInputSchema = object({
  imageId: string(),
});

export const imagePageLoaderFn = createServerFn({ method: "GET" })
  .inputValidator(ImagePageLoaderInputSchema)
  .handler(async ({ data }) => {
    const image = await cachedFetchImageById(data.imageId);

    if (!image.success) {
      throw new Error(image.error.message);
    }

    if (!image.data) {
      throw notFound();
    }

    return {
      image: image.data,
    };
  });
