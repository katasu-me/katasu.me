import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from "next/link";
import { twMerge } from "tailwind-merge";
import IconPlant from "@/assets/icons/plant.svg";
import LogoImage from "@/assets/logo.svg";
import BudouX from "@/components/BudouX";
import Button from "@/components/Button";
import DemoImages from "@/components/DemoImages";
import Footer from "@/components/Layout/Footer";
import { SITE_NAME } from "@/constants/site";
import SignInDrawer from "@/features/auth/components/SignInDrawer";
import { getUserSession } from "@/lib/auth";

async function StartButton({ userId, className }: { userId: string | undefined; className?: string }) {
  const buttonClassname = twMerge("w-48", className);

  if (userId) {
    return (
      <Button asChild>
        <Link
          className={twMerge("mx-auto flex items-center justify-center gap-2", buttonClassname)}
          href={`/user/${userId}`}
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
  const { env } = await getCloudflareContext({
    async: true,
  });

  const { session } = await getUserSession(env.DB);

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
          <StartButton className="mt-8 pc:mt-10" userId={session?.user.id} />
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

        <StartButton className="my-32 mt-8" userId={session?.user.id} />
      </section>

      <Footer mode="developed-by" />
    </div>
  );
}
