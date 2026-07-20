import { createFileRoute } from "@tanstack/react-router";
import { css } from "styled-system/css";
import { Loading } from "@/components/Loading";
import NotFoundPage from "@/components/NotFoundPage";
import { generateMetadata } from "@/libs/meta";

export const Route = createFileRoute("/404")({
  head: () => ({
    meta: generateMetadata({
      pageTitle: "ページが見つかりません",
      noindex: true,
    }),
  }),
  component: NotFoundPage,
  pendingComponent: () => <Loading cssProps={css.raw({ gridColumnStart: "2", h: "screen" })} />,
});
