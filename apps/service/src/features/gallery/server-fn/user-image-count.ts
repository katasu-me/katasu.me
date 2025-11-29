import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { object, string } from "valibot";
import { fetchTotalImageCount } from "../libs/cached-image-count";

const UserImageCountInputSchema = object({
  userId: string(),
});

const userImageCountFn = createServerFn({ method: "GET" })
  .inputValidator(UserImageCountInputSchema)
  .handler(async ({ data }) => {
    const result = await fetchTotalImageCount(data.userId);

    if (!result.success) {
      throw new Error(result.error.message);
    }

    return result.data;
  });

export const USER_IMAGE_COUNT_QUERY_KEY = "user-image-count";

export const userImageCountQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: [USER_IMAGE_COUNT_QUERY_KEY, userId],
    queryFn: () => userImageCountFn({ data: { userId } }),
  });
