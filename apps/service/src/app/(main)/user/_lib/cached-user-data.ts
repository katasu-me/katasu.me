import { fetchPublicUserDataById } from "@katasu.me/service-db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cache } from "react";
import { CACHE_KEYS, getCached } from "@/lib/cache";

export const cachedFetchPublicUserDataById = cache(async (userId: string) => {
  const { env } = getCloudflareContext();

  return getCached(env.CACHE_KV, CACHE_KEYS.user(userId), async () => {
    return fetchPublicUserDataById(env.DB, userId);
  });
});
