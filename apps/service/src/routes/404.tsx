import { createFileRoute } from "@tanstack/react-router";
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
  pendingComponent: () => <Loading className="col-start-2 h-screen" />,
});
