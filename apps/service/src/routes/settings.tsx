import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";
import IconMoodMrrr from "@/assets/icons/mood-wrrr.svg?react";
import IconUser from "@/assets/icons/user.svg?react";
import Button from "@/components/Button";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Message from "@/components/Message";
import { requireAuth } from "@/features/auth/libs/auth";
import { signOut } from "@/features/auth/libs/auth-client";
import { cachedFetchPublicUserDataById } from "@/features/auth/libs/cached-user-data";
import SeeyouSoonDrawer from "@/features/settings/components/SeeyouSoonDrawer";
import UserSettingsForm from "@/features/settings/components/UserSettingsForm";
import { generateMetadata } from "@/libs/meta";
import { getUserAvatarUrl } from "@/libs/r2";

const settingsPageLoaderFn = createServerFn().handler(async () => {
  const { session } = await requireAuth();

  const userResult = await cachedFetchPublicUserDataById(session.user.id);
  if (!userResult.success || !userResult.data) {
    throw new Error("ユーザー情報の取得に失敗しました");
  }

  const userData = userResult.data;
  const avatarUrl = userData.hasAvatar ? getUserAvatarUrl(userData.id, userData.avatarSetAt) : null;

  return {
    user: userData,
    avatarUrl,
  };
});

export const Route = createFileRoute("/settings")({
  component: RouteComponent,
  errorComponent: ({ error }) => {
    return <Message message={error.message} icon="error" />;
  },
  loader: async () => {
    return settingsPageLoaderFn();
  },
  head: () => {
    return {
      meta: generateMetadata({
        pageTitle: "設定",
        noindex: true,
      }),
    };
  },
});

function RouteComponent() {
  const { user: loggedInUser } = Route.useLoaderData();

  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleDeleteSuccess = async () => {
    await signOut();
    alert("アカウントの削除が完了しました。またね！");
    navigate({ to: "/" });
  };

  const avatarUrl = loggedInUser.hasAvatar ? getUserAvatarUrl(loggedInUser.id, loggedInUser.avatarSetAt) : null;

  return (
    <div className="col-span-full grid grid-cols-subgrid gap-y-12 py-16">
      <Header user={loggedInUser} sessionUserId={loggedInUser.id} />

      <h1 className="col-start-2 text-4xl">設定</h1>

      <section className="col-start-2 flex flex-col gap-8">
        <h2 className="flex items-center gap-2 text-2xl">
          <IconUser className="size-6" />
          ユーザー情報
        </h2>

        <UserSettingsForm
          user={{
            name: loggedInUser.name,
            avatarUrl,
          }}
        />
      </section>

      <section className="col-start-2 flex flex-col gap-4">
        <h2 className="flex items-center gap-2 text-2xl">
          <IconMoodMrrr className="size-6" />
          危険な操作
        </h2>

        <p className="mb-2 text-sm text-warm-black">
          アカウントを削除すると、投稿した画像やタグなどのデータがすべて削除されます。
        </p>

        <Button variant="danger" onClick={() => setIsDrawerOpen(true)}>
          アカウントを削除する
        </Button>

        <SeeyouSoonDrawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} onSuccess={handleDeleteSuccess} />
      </section>

      <Footer className="col-start-2" mode="logged-in-user" sessionUserId={loggedInUser.id} />
    </div>
  );
}
