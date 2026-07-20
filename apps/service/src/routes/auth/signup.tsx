import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { css } from "styled-system/css";
import ComingSoon from "@/components/ComingSoon";
import { Loading } from "@/components/Loading";
import { requireAuth } from "@/features/auth/libs/auth";
import { generateMetadata } from "@/libs/meta";

const signupPageBeforeLoadFn = createServerFn().handler(async () => {
  const { session } = await requireAuth();

  // 新規登録済ならマイページへリダイレクト
  if (session.user.name) {
    throw redirect({
      to: "/user/$userSlug",
      params: { userSlug: session.user.id },
      search: {
        view: "timeline",
        page: 1,
      },
    });
  }
});

export const Route = createFileRoute("/auth/signup")({
  component: ComingSoon,
  pendingComponent: () => <Loading cssProps={css.raw({ gridColumnStart: "2", h: "screen" })} />,
  beforeLoad: async () => {
    return signupPageBeforeLoadFn();
  },
  head: () => {
    return {
      meta: generateMetadata({
        pageTitle: "新規登録",
        noindex: true,
      }),
    };
  },
});
