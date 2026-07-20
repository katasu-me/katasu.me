import { createFileRoute } from "@tanstack/react-router";
import ComingSoon from "@/components/ComingSoon";
import { generateMetadata } from "@/libs/meta";

export const Route = createFileRoute("/report/_layout/image")({
  component: ComingSoon,
  head: () => {
    return {
      meta: generateMetadata({
        pageTitle: "投稿を報告",
        noindex: true,
      }),
    };
  },
});
