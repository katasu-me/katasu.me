import { createFileRoute } from "@tanstack/react-router";
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
});
