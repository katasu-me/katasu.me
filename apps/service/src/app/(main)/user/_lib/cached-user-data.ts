import { fetchPublicUserDataById } from "@katasu.me/service-db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { unstable_cacheTag } from "next/cache";
import { cache } from "react";

export const cachedFetchPublicUserDataById = cache(async (userId: string) => {
  "use cache";

  unstable_cacheTag(`user:${userId}`);

  const { env } = getCloudflareContext();
  return fetchPublicUserDataById(env.DB, userId);
});
