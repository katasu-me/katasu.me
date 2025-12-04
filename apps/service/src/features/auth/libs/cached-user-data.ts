import { env } from "cloudflare:workers";
import { fetchPublicUserDataById } from "@katasu.me/service-db";
import { CACHE_KEYS, getCached } from "@/libs/cache";

export const cachedFetchPublicUserDataById = async (userId: string) => {
  return getCached(env.CACHE_KV, CACHE_KEYS.user(userId), async () => {
    return fetchPublicUserDataById(env.DB, userId);
  });
};
