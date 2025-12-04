import { env } from "cloudflare:workers";
import { fetchTagsByUserId } from "@katasu.me/service-db";
import { createServerFn } from "@tanstack/react-start";
import { object, string } from "valibot";
import { CACHE_KEYS, getCached } from "@/libs/cache";

const TagListPageLoaderInputSchema = object({
  userId: string(),
});

export const tagListPageLoaderFn = createServerFn({ method: "GET" })
  .inputValidator(TagListPageLoaderInputSchema)
  .handler(async ({ data }) => {
    const allTagsResult = await getCached(env.CACHE_KV, CACHE_KEYS.userTagsByName(data.userId), async () => {
      return fetchTagsByUserId(env.DB, data.userId, {
        order: "name",
      });
    });

    if (!allTagsResult.success) {
      throw new Error(allTagsResult.error.message);
    }

    return {
      allTags: allTagsResult.data ?? [],
    };
  });
