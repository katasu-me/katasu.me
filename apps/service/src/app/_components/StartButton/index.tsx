import type { PublicUserData } from "@katasu.me/service-db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from "next/link";
import { twMerge } from "tailwind-merge";
import { cachedFetchPublicUserDataById } from "@/app/_lib/cached-user-data";
import IconLoader2 from "@/assets/icons/loader-2.svg";
import IconPlant from "@/assets/icons/plant.svg";
import Button from "@/components/Button";
import SignInDrawer from "@/features/auth/components/SignInDrawer";
import { getUserSession } from "@/lib/auth";

type Props = {
  className?: string;
};

export function StartButtonFallback({ className }: Props) {
  return (
    <Button className={twMerge("flex w-48 items-center justify-center gap-2", className)} disabled>
      <IconLoader2 className="size-5 animate-spin" />
      よみこみちゅう
    </Button>
  );
}

export default async function StartButton({ className }: Props) {
  const { env } = getCloudflareContext();
  const { session } = await getUserSession(env.DB);

  let user: PublicUserData | undefined;

  if (session?.user) {
    const result = await cachedFetchPublicUserDataById(session.user.id);

    if (result.success) {
      user = result.data;
    }
  }

  // TODO: リリース時には外す
  if (process.env.NODE_ENV === "production") {
    return (
      <div className={className}>
        <Button asChild>
          <Link className="mx-auto flex w-fit items-center justify-center gap-2" href="/user/8uB8pmZ-pcGqxBfdpnWo6">
            <IconPlant className="size-5" />
            開発者のかたすみをのぞく
          </Link>
        </Button>
        <Link className="mt-4 block text-center text-warm-black-50 text-xs hover:underline" href="/closed-beta">
          βテスト登録済のかたはこちら
        </Link>
      </div>
    );
  }

  const buttonClassname = twMerge("w-48", className);

  // 登録 & 同意が完了している場合
  if (user?.id && user.termsAgreedAt && user.privacyPolicyAgreedAt) {
    return (
      <Button asChild>
        <Link
          className={twMerge("mx-auto flex items-center justify-center gap-2", buttonClassname)}
          href={`/user/${user.id}`}
        >
          <IconPlant className="size-5" />
          マイページへ
        </Link>
      </Button>
    );
  }

  return (
    <SignInDrawer>
      <Button className={buttonClassname}>はじめる</Button>
    </SignInDrawer>
  );
}
