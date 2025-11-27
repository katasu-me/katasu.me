import { env } from "cloudflare:workers";
import { fetchTotalImageCountByUserId } from "@katasu.me/service-db";
import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Loading } from "@/components/Loading";
import Message from "@/components/Message";
import { cachedFetchPublicUserDataById } from "@/features/auth/libs/cached-user-data";
import { CACHE_KEYS, getCached } from "@/libs/cache";

const cachedFetchTotalImageCount = async (userId: string) => {
  return getCached(env.CACHE_KV, CACHE_KEYS.userImageCount(userId), async () => {
    return fetchTotalImageCountByUserId(env.DB, userId);
  });
};

const userPageBeforeLoadFn = createServerFn()
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data }) => {
    const userResult = await cachedFetchPublicUserDataById(data.userId);

    console.log("[DEBUG] userPageBeforeLoadFn: fetched userResult", userResult);

    // 存在しない、または新規登録が完了していない場合は404
    if (
      !userResult.success ||
      !userResult.data ||
      !userResult.data.termsAgreedAt ||
      !userResult.data.privacyPolicyAgreedAt
    ) {
      console.log("[DEBUG] userPageBeforeLoadFn: user not found or not completed registration");
      throw notFound();
    }

    const user = userResult.data;
    const totalImageCount = await cachedFetchTotalImageCount(user.id);

    console.log("[DEBUG] userPageBeforeLoadFn: fetched user", user);
    console.log("[DEBUG] userPageBeforeLoadFn: fetched totalImageCount", totalImageCount);

    return {
      user,
      userTotalImageCount: totalImageCount.success ? totalImageCount.data : 0,
    };
  });

export const Route = createFileRoute("/user/_layout/$userId")({
  component: UserLayoutComponent,
  errorComponent: ({ error }) => {
    return <Message message={error.message} icon="error" />;
  },
  pendingComponent: () => {
    return <Loading className="col-start-2 h-[80vh]" />;
  },
  beforeLoad: async ({ params }) => {
    const result = await userPageBeforeLoadFn({
      data: {
        userId: params.userId,
      },
    });

    console.log("[DEBUG] UserLayout beforeLoad: userPageBeforeLoadFn result", result);

    return result;
  },
});

function UserLayoutComponent() {
  const { user } = Route.useRouteContext();

  console.log("[DEBUG] UserLayoutComponent rendered: user", user);

  return (
    <div className="col-span-full grid grid-cols-subgrid gap-y-12 py-16">
      <Header
        user={user}
        rightMenu={{
          loggedInUserId: user.id,
        }}
      />
      <Outlet />
      <Footer className="col-start-2" mode="logged-in-user" userId={user.id} />
    </div>
  );
}
