import { fetchImageById } from "@katasu.me/service-db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cache } from "react";

export const cachedFetchImageById = cache(async (imageId: string) => {
  const { env } = getCloudflareContext();
  return await fetchImageById(env.DB, imageId);
});
