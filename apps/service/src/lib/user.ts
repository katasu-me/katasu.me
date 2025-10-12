import { getUserById, type User } from "@katasu.me/service-db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { unstable_cacheTag as cacheTag } from "next/cache";
import { userDataCacheTag } from "@/lib/cache-tags";

/**
 * ユーザー情報を取得
 * @param userId ユーザーID
 * @returns ユーザー情報、存在しない場合はundefined
 */
export async function cachedFetchUserById(userId: string): Promise<User | undefined> {
  "use cache";

  cacheTag(userDataCacheTag(userId));

  const { env } = getCloudflareContext();
  const user = await getUserById(env.DB, userId);

  return user;
}
