import { env } from "cloudflare:workers";
import { fetchTotalImageCountByUserId } from "@katasu.me/service-db";
import { CACHE_KEYS, getCached } from "@/libs/cache";

export const cachedFetchTotalImageCount = async (userId: string) => {
  return getCached(env.CACHE_KV, CACHE_KEYS.userImageCount(userId), async () => {
    return fetchTotalImageCountByUserId(env.DB, userId);
  });
};
