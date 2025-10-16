import { fetchImageById } from "@katasu.me/service-db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cache } from "react";
import { CACHE_KEYS, getCached } from "@/lib/cache";

export const cachedFetchImageById = cache(async (imageId: string) => {
  const { env } = getCloudflareContext();

  return getCached(env.CACHE_KV, CACHE_KEYS.imageDetail(imageId), async () => {
    return await fetchImageById(env.DB, imageId);
  });
});
