import { fetchTotalImageCountByUserId, getUserById } from "@katasu.me/service-db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { unstable_cacheTag as cacheTag, revalidateTag } from "next/cache";
import { userDataCacheTag, userPageCacheTag } from "@/lib/cache-tags";

/**
 * ユーザー情報を取得
 * @param userId ユーザーID
 * @returns ユーザー情報、存在しない場合はundefined
 */
export async function cachedFetchUserById(userId: string) {
  "use cache";

  cacheTag(userDataCacheTag(userId));

  const { env } = getCloudflareContext();
  const user = await getUserById(env.DB, userId);

  return user;
}

/**
 * ユーザーの投稿数を取得
 * @param userId ユーザーID
 * @return 画像総数
 */
export const cachedFetchTotalImageCount = async (userId: string) => {
  "use cache";

  const tag = userPageCacheTag(userId);
  cacheTag(tag);

  const { env } = getCloudflareContext();

  const result = await fetchTotalImageCountByUserId(env.DB, userId);

  if (!result.success) {
    revalidateTag(tag);
    return 0;
  }

  return result.data;
};
