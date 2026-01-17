import { env } from "cloudflare:workers";
import { fetchPublicUserDataByCustomUrlOrId } from "@katasu.me/service-db";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { getUserSession } from "@/features/auth/libs/auth";

const userPageBeforeLoadFn = createServerFn()
  .inputValidator((data: { userSlug: string; pathname: string }) => data)
  .handler(async ({ data }) => {
    const [userResult, { session }] = await Promise.all([
      fetchPublicUserDataByCustomUrlOrId(env.DB, data.userSlug),
      getUserSession(),
    ]);

    // 存在しない、または新規登録が完了していない場合は404
    if (
      !userResult.success ||
      !userResult.data ||
      !userResult.data.user.termsAgreedAt ||
      !userResult.data.user.privacyPolicyAgreedAt
    ) {
      // NOTE: throw notfound() だと HTML が帰らずエラーページが出てしまう。ここがパスを持たないルートだからかも
      throw redirect({ to: "/404" });
    }

    const { user, foundByCustomUrl } = userResult.data;

    // IDでアクセスされた場合、カスタムURLがあればリダイレクト
    if (!foundByCustomUrl && user.customUrl) {
      const newPathname = data.pathname.replace(`/user/${data.userSlug}`, `/user/${user.customUrl}`);
      throw redirect({
        to: newPathname,
        statusCode: 301,
      });
    }

    return {
      user,
      sessionUserId: session?.user?.id,
    };
  });

export const Route = createFileRoute("/user/_layout/$userSlug")({
  component: UserLayoutComponent,
  beforeLoad: async ({ params, location }) => {
    return userPageBeforeLoadFn({
      data: {
        userSlug: params.userSlug,
        pathname: location.pathname,
      },
    });
  },
  loader: async ({ context }) => {
    // NOTE:
    // useRouteContextで取得すると、スマホで一定時間置いてからページバックで遷移したとき
    // contextがundefinedになる問題があるため、loader経由で渡してる
    return {
      user: context.user,
      sessionUserId: context.sessionUserId,
    };
  },
});

function UserLayoutComponent() {
  const { user, sessionUserId } = Route.useLoaderData();

  return (
    <div className="col-span-full grid grid-cols-subgrid gap-y-12 py-16">
      <Header user={user} sessionUserId={sessionUserId} />
      <Outlet />
      <Footer className="col-start-2" mode="logged-in-user" sessionUserId={sessionUserId} />
    </div>
  );
}
