import { fetchImageById } from "@katasu.me/service-db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { unstable_cache } from "next/cache";
import { imagePageCacheTag } from "@/lib/cache-tags";

export const cachedFetchImage = async (userId: string, imageId: string) => {
  return unstable_cache(
    async (userId: string, imageId: string) => {
      const { env } = getCloudflareContext();
      return await fetchImageById(env.DB, imageId);
    },
    [`image-data-${userId}-${imageId}`],
    {
      tags: [imagePageCacheTag(userId, imageId)],
    },
  )(userId, imageId);
};
