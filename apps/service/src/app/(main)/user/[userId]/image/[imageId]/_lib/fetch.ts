import { fetchImageById } from "@katasu.me/service-db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { unstable_cacheTag as cacheTag } from "next/cache";
import { imagePageCacheTag } from "@/lib/cache-tags";

export const cachedFetchImage = async (userId: string, imageId: string) => {
  "use cache";

  cacheTag(imagePageCacheTag(userId, imageId));

  const { env } = getCloudflareContext();

  return fetchImageById(env.DB, imageId);
};
