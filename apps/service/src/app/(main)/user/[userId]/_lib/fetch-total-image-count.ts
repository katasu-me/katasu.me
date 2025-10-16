import { fetchTotalImageCountByUserId } from "@katasu.me/service-db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cache } from "react";
import { CACHE_KEYS, getCached } from "@/lib/cache";

export const cachedFetchTotalImageCount = cache(async (userId: string) => {
  const { env } = getCloudflareContext();

  return getCached(env.CACHE_KV, CACHE_KEYS.userImageCount(userId), async () => {
    return fetchTotalImageCountByUserId(env.DB, userId);
  });
});
