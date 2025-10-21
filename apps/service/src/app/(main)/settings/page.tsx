import { getCloudflareContext } from "@opennextjs/cloudflare";
import { notFound } from "next/navigation";
import { cachedFetchPublicUserDataById } from "@/app/_lib/cached-user-data";
import IconMoodMrrr from "@/assets/icons/mood-wrrr.svg";
import IconUser from "@/assets/icons/user.svg";
import Button from "@/components/Button";
import Header from "@/components/Header";
import { requireAuth } from "@/lib/auth";
import { getUserAvatarUrl } from "@/lib/r2";
import SeeyouSoonDrawer from "./_components/SeeyouSoonDrawer";
import UserSettingsForm from "./_components/UserSettingsForm";

export default async function Settings() {
  const { env } = getCloudflareContext();
  const { session } = await requireAuth(env.DB);

  const userResult = await cachedFetchPublicUserDataById(session.user.id);

  if (!userResult.success || !userResult.data) {
    notFound();
  }

  const user = userResult.data;

  return (
    <div className="col-span-full grid grid-cols-subgrid gap-y-12 py-16">
      <Header user={user} />

      <h1 className="col-start-2 text-4xl">設定</h1>

      <div className="col-start-2 flex flex-col gap-4">
        <h2 className="flex items-center gap-2 text-2xl">
          <IconUser className="size-6" />
          ユーザー情報
        </h2>

        <div className="flex w-full justify-center rounded-xl bg-warm-black-10 p-8">
          <UserSettingsForm
            key={user.name} // ユーザー名が変わったら再マウントして変更を反映
            defaultUsername={user.name}
            defaultUserAvatar={user.hasAvatar ? getUserAvatarUrl(user.id, user.avatarSetAt) : undefined}
          />
        </div>
      </div>

      <div className="col-start-2 flex flex-col gap-4">
        <h2 className="flex items-center gap-2 text-2xl">
          <IconMoodMrrr className="size-6" />
          危険な操作
        </h2>

        <div className="flex w-full justify-center rounded-xl bg-warm-black-10 p-8">
          <div className="flex w-full pc:flex-row flex-col items-center justify-between gap-4 pc:gap-0">
            <div>
              <span className="block">アカウントを削除</span>
              <span className="block text-sm text-warm-black-50">ユーザー情報や投稿した画像をすべて削除します</span>
            </div>

            <SeeyouSoonDrawer
              triggerChildren={
                <Button className="pc:w-fit w-full" variant="danger">
                  削除する
                </Button>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
