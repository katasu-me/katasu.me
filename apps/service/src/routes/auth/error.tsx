import { createFileRoute } from "@tanstack/react-router";
import MessagePage from "@/components/MessagePage";
import { generateMetadata } from "@/libs/meta";

export const Route = createFileRoute("/auth/error")({
  component: RouteComponent,
  head: () => {
    return {
      meta: generateMetadata({
        pageTitle: "認証エラー",
        noindex: true,
      }),
    };
  },
});

function RouteComponent() {
  return (
    <MessagePage title="Error" showBackButton>
      <p>認証に失敗しました</p>
      <p>しばらく時間をおいて、再度お試しください 🙇</p>
    </MessagePage>
  );
}
