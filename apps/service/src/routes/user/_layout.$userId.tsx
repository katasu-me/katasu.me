import { env } from "cloudflare:workers";
import { fetchTotalImageCountByUserId } from "@katasu.me/service-db";
import { createFileRoute, notFound, Outlet, useRouteContext } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { fallback, number, object, parse } from "valibot";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { getUserSession } from "@/features/auth/libs/auth";
import { cachedFetchPublicUserDataById } from "@/features/auth/libs/cached-user-data";
import { GalleryViewSchema } from "@/features/gallery/schemas/view";
import { CACHE_KEYS, getCached } from "@/libs/cache";

const searchParamsSchema = object({
  view: fallback(GalleryViewSchema, "timeline"),
  page: fallback(number(), 1),
});

const cachedFetchTotalImageCount = async (userId: string) => {
  return getCached(env.CACHE_KV, CACHE_KEYS.userImageCount(userId), async () => {
    return fetchTotalImageCountByUserId(env.DB, userId);
  });
};

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

    const totalImageCount = await cachedFetchTotalImageCount(user.id);

    return {
      session,
      user,
      userTotalImageCount: totalImageCount.success ? totalImageCount.data : 0,
    };
  });

export const Route = createFileRoute("/user/_layout/$userId")({
  component: UserLayoutComponent,
  validateSearch: (search) => parse(searchParamsSchema, search),
  beforeLoad: async ({ params }) => {
    return fetchUser({
      data: {
        userId: params.userId,
      },
    });
  },
});

function UserLayoutComponent() {
  const { user, session } = useRouteContext({ from: "/user/_layout/$userId" });

  return (
    <div className="col-span-full grid grid-cols-subgrid gap-y-12 py-16">
      <Header user={user} rightMenu={session?.user?.id ? { loggedInUserId: session.user.id } : undefined} />
      <Outlet />
      <Footer className="col-start-2" mode="logged-in-user" userId={session?.user?.id} />
    </div>
  );
}
