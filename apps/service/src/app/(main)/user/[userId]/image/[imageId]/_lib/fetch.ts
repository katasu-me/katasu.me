import { fetchImageById } from "@katasu.me/service-db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { unstable_cacheTag as cacheTag, revalidateTag } from "next/cache";
import { imagePageCacheTag } from "@/lib/cache-tags";

export const cachedFetchImage = async (userId: string, imageId: string) => {
  "use cache";

  const tag = imagePageCacheTag(userId, imageId);
  cacheTag(tag);

  const { env } = getCloudflareContext();

  const result = await fetchImageById(env.DB, imageId);

  if (!result.success) {
    revalidateTag(tag);
  }

  return result;
};
