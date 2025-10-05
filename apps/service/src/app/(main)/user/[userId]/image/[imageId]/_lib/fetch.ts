import { fetchImageById } from "@katasu.me/service-db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { unstable_cacheTag as cacheTag } from "next/cache";
import { imagePageCacheTag, userPageCacheTag } from "@/lib/cache-tags";

export const cachedFetchImage = async (userId: string, imageId: string) => {
  "use cache";

  cacheTag(userPageCacheTag(userId), imagePageCacheTag(userId, imageId));

  const { env } = getCloudflareContext();

  return fetchImageById(env.DB, imageId);
};
