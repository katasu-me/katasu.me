import { createFileRoute } from "@tanstack/react-router";
import ComingSoon from "@/components/ComingSoon";
import { generateMetadata } from "@/libs/meta";

export const Route = createFileRoute("/settings")({
  component: ComingSoon,
  head: () => {
    return {
      meta: generateMetadata({
        pageTitle: "設定",
        noindex: true,
      }),
    };
  },
});
