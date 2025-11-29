import { env } from "cloudflare:workers";
import { fetchImageById } from "@katasu.me/service-db";
import { queryOptions } from "@tanstack/react-query";
import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { type InferInput, object, string } from "valibot";
import { CACHE_KEYS, getCached } from "@/libs/cache";

const cachedFetchImageById = async (imageId: string) => {
  return getCached(env.CACHE_KV, CACHE_KEYS.imageDetail(imageId), async () => {
    return await fetchImageById(env.DB, imageId);
  });
};

const ImagePageLoaderInputSchema = object({
  imageId: string(),
});

const imagePageLoaderFn = createServerFn({ method: "GET" })
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

export type ImagePageLoaderInput = InferInput<typeof ImagePageLoaderInputSchema>;
export const IMAGE_PAGE_QUERY_KEY = "image-page";

export const imagePageQueryOptions = (input: ImagePageLoaderInput) =>
  queryOptions({
    queryKey: [IMAGE_PAGE_QUERY_KEY, input.imageId],
    queryFn: () => imagePageLoaderFn({ data: input }),
  });
