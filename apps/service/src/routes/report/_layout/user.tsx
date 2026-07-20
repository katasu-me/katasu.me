import { createFileRoute } from "@tanstack/react-router";
import ComingSoon from "@/components/ComingSoon";
import { generateMetadata } from "@/libs/meta";

export const Route = createFileRoute("/report/_layout/user")({
  component: ComingSoon,
  head: () => {
    return {
      meta: generateMetadata({
        pageTitle: "ユーザーを報告",
        noindex: true,
      }),
    };
  },
});
