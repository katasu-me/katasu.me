import { createFileRoute } from "@tanstack/react-router";
import ComingSoon from "@/components/ComingSoon";
import { generateMetadata } from "@/libs/meta";

export const Route = createFileRoute("/closed-beta")({
  component: ComingSoon,
  head: () => {
    return {
      meta: generateMetadata({
        pageTitle: "βテスト",
        noindex: true,
      }),
    };
  },
});
