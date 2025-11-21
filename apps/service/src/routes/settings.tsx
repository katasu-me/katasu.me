import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";
import IconUser from "@/assets/icons/user.svg?react";
import Button from "@/components/Button";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { requireAuth } from "@/features/auth/libs/auth";
import { signOut } from "@/features/auth/libs/auth-client";
import { cachedFetchPublicUserDataById } from "@/features/auth/libs/cached-user-data";
import SeeyouSoonDrawer from "@/features/settings/components/SeeyouSoonDrawer";
import UserSettingsForm from "@/features/settings/components/UserSettingsForm";
import { getUserAvatarUrl } from "@/libs/r2";

const getSettingsPageData = createServerFn().handler(async () => {
  const { session } = await requireAuth();
  const userResult = await cachedFetchPublicUserDataById(session.user.id);

  if (!userResult.success || !userResult.data) {
    throw new Error("ユーザー情報の取得に失敗しました");
  }

  const userData = userResult.data;
  const avatarUrl = userData.hasAvatar ? getUserAvatarUrl(userData.id, userData.avatarSetAt) : null;

  return {
    session,
    user: userData,
    avatarUrl,
  };
});

export const Route = createFileRoute("/settings")({
  component: RouteComponent,
  loader: async () => {
    return getSettingsPageData();
  },
});

function RouteComponent() {
  const data = Route.useLoaderData();
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleDeleteSuccess = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  return (
    <div className="col-span-full grid grid-cols-subgrid gap-y-12 py-16">
      <Header user={data.user} rightMenu={{ loggedInUserId: data.session.user.id }} />

      <h1 className="col-start-2 text-4xl">設定</h1>

      <div className="col-start-2 flex flex-col gap-8">
        <h2 className="flex items-center gap-2 text-2xl">
          <IconUser className="size-6" />
          ユーザー情報
        </h2>

        <UserSettingsForm
          user={{
            name: data.user.name,
            avatarUrl: data.avatarUrl,
          }}
        />

        <h2 className="mb-4 font-bold text-lg">アカウント削除</h2>
        <p className="mb-4 text-sm text-warm-black">
          アカウントを削除すると、投稿した画像やタグなどのデータがすべて削除されます。
        </p>
        <Button variant="danger" onClick={() => setIsDrawerOpen(true)}>
          アカウントを削除する
        </Button>

        <SeeyouSoonDrawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} onSuccess={handleDeleteSuccess} />
      </div>

      <Footer className="col-start-2" mode="logged-in-user" userId={data.session.user.id} />
    </div>
  );
}
