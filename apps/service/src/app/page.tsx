import type { PublicUserData } from "@katasu.me/service-db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from "next/link";
import { twMerge } from "tailwind-merge";
import IconPlant from "@/assets/icons/plant.svg";
import LogoImage from "@/assets/logo.svg";
import BudouX from "@/components/BudouX";
import Button from "@/components/Button";
import DemoImages from "@/components/DemoImages";
import Footer from "@/components/Footer";
import { SITE_NAME } from "@/constants/site";
import SignInDrawer from "@/features/auth/components/SignInDrawer";
import { getUserSession } from "@/lib/auth";
import { cachedFetchPublicUserDataById } from "./(main)/user/_lib/cached-user-data";

async function StartButton({ user, className }: { user: PublicUserData | undefined; className?: string }) {
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

export default async function Home() {
  const { env } = await getCloudflareContext({ async: true });
  const { session } = await getUserSession(env.DB);

  let user: PublicUserData | undefined;

  if (session?.user) {
    const result = await cachedFetchPublicUserDataById(session.user.id);

    if (result.success) {
      user = result.data;
    }
  }

  return (
    <div className="col-start-2">
      <section className="flex h-[calc(100vh-16px)] items-center justify-center">
        <div className="flex flex-col items-center justify-center">
          <LogoImage className="pc:w-64 w-48" />
          <h1 className="mt-16 pc:mt-20 text-center font-normal pc:text-2xl text-lg leading-7 pc:leading-9 pc:tracking-[0.2em] tracking-[0.1em]">
            「じぶん」のための、
            <br />
            インターネットのかたすみ
          </h1>

          {/* TODO: リリース時には外す */}
          <p className="mt-8">
            準備中。年内リリース予定 <span className="text-xs">(かも)</span>
          </p>

          <StartButton className="mt-8 pc:mt-10" user={user} />
        </div>
      </section>

      <section className="mx-auto text-center">
        <div className="flex flex-col gap-6 text-warm-black leading-[1.6] tracking-[0.04em]">
          <p>
            <BudouX>{`${SITE_NAME}はインターネットのかたすみにある、ぽつんと画像をおいておける場所です。`}</BudouX>
          </p>
          <p>
            <BudouX>「せっかくだから写真や画像を公開したい」</BudouX>
            <BudouX>「けど、SNSはなんか違うかも……」</BudouX>
          </p>
          <p>
            <BudouX>みたいな気持ちから生まれました。</BudouX>
          </p>

          <p className="mt-6">
            <BudouX>じぶんのための空間をつくる。</BudouX>
          </p>

          <p>
            <BudouX>気になった人がふらっと入って、ふらっと去っていく。</BudouX>
          </p>

          <p>
            <BudouX>そんなかたすみの空間をはじめませんか？</BudouX>
          </p>
        </div>

        <DemoImages className="mx-auto mt-32 mb-16" />

        <StartButton className="my-32 mt-8" user={user} />
      </section>

      <Footer mode="developed-by" />
    </div>
  );
}
