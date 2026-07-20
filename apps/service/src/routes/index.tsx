import type { PublicUserData } from "@katasu.me/service-db";
import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { css } from "styled-system/css";
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
  pendingComponent: () => <Loading cssProps={css.raw({ gridColumnStart: "2", h: "screen" })} />,
});

function App() {
  const { user } = Route.useLoaderData();

  return (
    <div className={css({ gridColumnStart: "2" })}>
      <section
        className={css({ display: "flex", h: "calc(100vh - 16px)", alignItems: "center", justifyContent: "center" })}
      >
        <div
          className={css({ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" })}
        >
          <LogoImage className={css({ w: { base: "48", pc: "64" } })} />
          <h1
            className={css({
              mt: { base: "16", pc: "20" },
              textAlign: "center",
              fontWeight: "normal",
              fontSize: { base: "lg", pc: "2xl" },
              lineHeight: { base: "7", pc: "9" },
              letterSpacing: { base: "0.1em", pc: "0.2em" },
            })}
          >
            「じぶん」のための、
            <br />
            インターネットのかたすみ
          </h1>

          <StartButton cssProps={css.raw({ mt: { base: "8", pc: "10" } })} user={user} />
        </div>
      </section>

      <section className={css({ mx: "auto", textAlign: "center" })}>
        <div className={css({ textAlign: "center", color: "warm-black", lineHeight: "8", letterSpacing: "0.04em" })}>
          <p>
            <BudouX>{`${SITE_NAME}は、インターネットのかたすみに画像をおけるサービスです。`}</BudouX>
          </p>

          <p className={css({ mt: "12" })}>
            <BudouX>「せっかくだから写真や画像を公開したい」</BudouX>
            <BudouX>「けど、SNSはなんか違うかも……」</BudouX>
            <br />
            <BudouX>みたいな気持ちから生まれました。</BudouX>
          </p>

          <p className={css({ mt: "12" })}>
            <BudouX>ここは開かれているけど、開かれすぎていない場所です。</BudouX>
            <br />
            <BudouX>ここにおいた画像は、あなたのページに辿りつかないと見ることができません。</BudouX>
          </p>

          <p className={css({ mt: "12" })}>
            <BudouX>じぶんがつくる「じぶん」のためのインターネットのかたすみ。</BudouX>
          </p>

          <p className={css({ mt: "12" })}>
            <BudouX>はじめてみませんか？</BudouX>
          </p>
        </div>

        <ClientOnly>
          <DemoImages className={css({ mx: "auto", my: "24" })} />
        </ClientOnly>

        <StartButton cssProps={css.raw({ my: "32", mt: "16" })} user={user} />
      </section>

      <Footer />
    </div>
  );
}
