import { env } from "cloudflare:workers";
import { fetchTotalImageCountByUserId } from "@katasu.me/service-db";
import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { boolean, object, optional, string } from "valibot";

const UserImageCountInputSchema = object({
  userId: string(),
  includeAllStatuses: optional(boolean()),
});

const userImageCountFn = createServerFn({ method: "GET" })
  .inputValidator(UserImageCountInputSchema)
  .handler(async ({ data }) => {
    const result = await fetchTotalImageCountByUserId(env.DB, data.userId, {
      includeAllStatuses: data.includeAllStatuses,
    });

    if (!result.success) {
      throw new Error(result.error.message);
    }

    return result.data;
  });

export const USER_IMAGE_COUNT_QUERY_KEY = "user-image-count";

export const userImageCountQueryOptions = (userId: string, includeAllStatuses = false) =>
  queryOptions({
    queryKey: [USER_IMAGE_COUNT_QUERY_KEY, userId, includeAllStatuses],
    queryFn: () => userImageCountFn({ data: { userId, includeAllStatuses } }),
  });
