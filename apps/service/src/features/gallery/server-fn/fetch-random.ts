import { env } from "cloudflare:workers";
import { fetchRandomImagesByTagId, fetchRandomImagesByUserId } from "@katasu.me/service-db";
import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { type InferOutput, literal, object, string, union } from "valibot";
import { ERROR_MESSAGE } from "../constants/error";

const FetchRandomImagesInputSchema = union([
  object({
    type: literal("user"),
    userId: string(),
  }),
  object({
    type: literal("tag"),
    tagId: string(),
  }),
]);

export type FetchRandomImagesInput = InferOutput<typeof FetchRandomImagesInputSchema>;

export const fetchRandomImagesFn = createServerFn({ method: "GET" })
  .inputValidator(FetchRandomImagesInputSchema)
  .handler(async ({ data }) => {
    // レートリミット
    const rateLimiterKey = data.type === "user" ? data.userId : data.tagId;
    const { success } = await env.ACTIONS_RATE_LIMITER.limit({
      key: `fetchRandomImages:${rateLimiterKey}`,
    });

    if (!success) {
      throw new Error(ERROR_MESSAGE.RATE_LIMIT_EXCEEDED);
    }

    const result =
      data.type === "user"
        ? await fetchRandomImagesByUserId(env.DB, data.userId)
        : await fetchRandomImagesByTagId(env.DB, data.tagId);

    if (!result.success) {
      throw new Error(result.error.message);
    }

    return result.data;
  });

const RANDOM_IMAGES_QUERY_KEY = "random-images";

export const getRandomImagesQueryKey = (input: FetchRandomImagesInput) => {
  if (input.type === "user") {
    return [RANDOM_IMAGES_QUERY_KEY, "user", input.userId];
  }

  return [RANDOM_IMAGES_QUERY_KEY, "tag", input.tagId];
};

export const randomImagesQueryOptions = (input: FetchRandomImagesInput) =>
  queryOptions({
    queryKey: getRandomImagesQueryKey(input),
    queryFn: () => fetchRandomImagesFn({ data: input }),
  });
