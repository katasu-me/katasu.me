import { fetchTotalImageCountByUserId } from "@katasu.me/service-db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cache } from "react";

export const cachedFetchTotalImageCount = cache(async (userId: string) => {
  const { env } = getCloudflareContext();
  return fetchTotalImageCountByUserId(env.DB, userId);
});
