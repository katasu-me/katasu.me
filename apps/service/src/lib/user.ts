import { fetchTotalImageCountByUserId, getPublicUserDataById } from "@katasu.me/service-db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { unstable_cache } from "next/cache";
import { userDataCacheTag, userPageCacheTag } from "@/lib/cache-tags";

/**
 * ユーザーの公開情報を取得
 * @param userId ユーザーID
 * @returns ユーザー情報、存在しない場合はundefined
 */
export async function cachedFetchPublicUserDataById(userId: string) {
  return unstable_cache(
    async (userId: string) => {
      const { env } = getCloudflareContext();
      return await getPublicUserDataById(env.DB, userId);
    },
    [`user-data-${userId}`],
    {
      tags: [userDataCacheTag(userId)],
    },
  )(userId);
}

/**
 * ユーザーの投稿数を取得
 * @param userId ユーザーID
 * @return 画像総数
 */
export async function cachedFetchTotalImageCount(userId: string) {
  return unstable_cache(
    async (userId: string) => {
      const { env } = getCloudflareContext();
      const result = await fetchTotalImageCountByUserId(env.DB, userId);

      if (!result.success) {
        return 0;
      }

      return result.data;
    },
    [`user-image-count-${userId}`],
    {
      tags: [userPageCacheTag(userId)],
    },
  )(userId);
}
