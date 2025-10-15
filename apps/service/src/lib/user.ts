import { fetchTotalImageCountByUserId, getPublicUserDataById } from "@katasu.me/service-db";
import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * ユーザーの公開情報を取得
 * @param userId ユーザーID
 * @returns ユーザー情報、存在しない場合はundefined
 */
export async function cachedFetchPublicUserDataById(userId: string) {
  // "use cache"; // 一時的に無効化

  // const tag = userDataCacheTag(userId);
  // cacheTag(tag);

  const { env } = getCloudflareContext();
  const result = await getPublicUserDataById(env.DB, userId);

  // if (!result.success) {
  //   revalidateTag(tag);
  // }

  return result;
}

/**
 * ユーザーの投稿数を取得
 * @param userId ユーザーID
 * @return 画像総数
 */
export const cachedFetchTotalImageCount = async (userId: string) => {
  // "use cache"; // 一時的に無効化

  // const tag = userPageCacheTag(userId);
  // cacheTag(tag);

  const { env } = getCloudflareContext();

  const result = await fetchTotalImageCountByUserId(env.DB, userId);

  if (!result.success) {
    // revalidateTag(tag);
    return 0;
  }

  return result.data;
};
