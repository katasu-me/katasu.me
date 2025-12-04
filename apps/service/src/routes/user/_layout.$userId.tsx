import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { getUserSession } from "@/features/auth/libs/auth";
import { cachedFetchPublicUserDataById } from "@/features/auth/libs/cached-user-data";

const userPageBeforeLoadFn = createServerFn()
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
      // NOTE: throw notfound() だと HTML が帰らずエラーページが出てしまう。ここがパスを持たないルートだからかな？
      throw redirect({ to: "/404" });
    }

    return {
      user: userResult.data,
      sessionUserId: session?.user?.id,
    };
  });

export const Route = createFileRoute("/user/_layout/$userId")({
  component: UserLayoutComponent,
  beforeLoad: async ({ params }) => {
    return userPageBeforeLoadFn({
      data: {
        userId: params.userId,
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
