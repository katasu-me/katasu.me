import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { fallback, number, object, parse } from "valibot";
import { getUserSession } from "@/features/auth/libs/auth";
import { cachedFetchPublicUserDataById } from "@/features/auth/libs/cached-user-data";
import { GalleryViewSchema } from "@/features/gallery/schemas/view";

const searchParamsSchema = object({
  view: fallback(GalleryViewSchema, "timeline"),
  page: fallback(number(), 1),
});

const fetchUser = createServerFn()
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data }) => {
    const [userResult, { session }] = await Promise.all([cachedFetchPublicUserDataById(data.userId), getUserSession()]);

    // 存在しない、または新規登録が完了していない場合は404
    if (
      !userResult.success ||
      !userResult.data ||
      !userResult.data.termsAgreedAt ||
      !userResult.data.privacyPolicyAgreedAt
    ) {
      throw notFound();
    }

    const user = userResult.data;

    return { user, session };
  });

export const Route = createFileRoute("/user/$userId")({
  validateSearch: (search) => parse(searchParamsSchema, search),
  beforeLoad: async ({ params }) => {
    return fetchUser({
      data: {
        userId: params.userId,
      },
    });
  },
});
