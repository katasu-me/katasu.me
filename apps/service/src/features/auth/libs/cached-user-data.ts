import { env } from "cloudflare:workers";
import { fetchPublicUserDataById } from "@katasu.me/service-db";
import { cache } from "react";
import { CACHE_KEYS, getCached } from "@/libs/cache";

export const cachedFetchPublicUserDataById = cache(async (userId: string) => {
  return getCached(env.CACHE_KV, CACHE_KEYS.user(userId), async () => {
    return fetchPublicUserDataById(env.DB, userId);
  });
});
