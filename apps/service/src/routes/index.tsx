import type { PublicUserData } from "@katasu.me/service-db";
import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import LogoImage from "@/assets/logo.svg?react";
import BudouX from "@/components/BudouX";
import Footer from "@/components/Footer";
import { Loading } from "@/components/Loading";
import { SITE_NAME } from "@/constants/site";
import StartButton from "@/features/auth/components/StartButton";
import { getUserSession } from "@/features/auth/libs/auth";
import { cachedFetchPublicUserDataById } from "@/features/auth/libs/cached-user-data";
import DemoImages from "@/features/top/components/DemoImages";

const topPageLoaderFn = createServerFn().handler(async () => {
  const { session } = await getUserSession();

  let user: PublicUserData | undefined;

  if (session?.user) {
    const result = await cachedFetchPublicUserDataById(session.user.id);

    if (result.success) {
      user = result.data;
    }
  }

  return { user };
});

export const Route = createFileRoute("/")({
  component: App,
  loader: async () => {
    return topPageLoaderFn();
  },
  pendingComponent: () => <Loading className="col-start-2 h-screen" />,
});

function App() {
  const { user } = Route.useLoaderData();

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

          <StartButton className="mt-8 pc:mt-10" user={user} />
        </div>
      </section>

      <section className="mx-auto text-center">
        <div className="text-center text-warm-black leading-8 tracking-[0.04em]">
          <p>
            <BudouX>{`${SITE_NAME}は、インターネットのかたすみに画像をおけるサービスです。`}</BudouX>
          </p>

          <p className="mt-12">
            <BudouX>「せっかくだから写真や画像を公開したい」</BudouX>
            <BudouX>「けど、SNSはなんか違うかも……」</BudouX>
            <br />
            <BudouX>みたいな気持ちから生まれました。</BudouX>
          </p>

          <p className="mt-12">
            <BudouX>ここは開かれているけど、開かれすぎていない場所です。</BudouX>
            <br />
            <BudouX>ここにおいた画像は、あなたのページに辿りつかないと見ることができません。</BudouX>
          </p>

          <p className="mt-12">
            <BudouX>じぶんがつくる「じぶん」のためのインターネットのかたすみ。</BudouX>
          </p>

          <p className="mt-12">
            <BudouX>はじめてみませんか？</BudouX>
          </p>
        </div>

        <ClientOnly>
          <DemoImages className="mx-auto my-24" />
        </ClientOnly>

        <StartButton className="my-32 mt-16" user={user} />
      </section>

      <Footer mode="developed-by" />
    </div>
  );
}
