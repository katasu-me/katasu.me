import { createFileRoute } from "@tanstack/react-router";
import Button from "@/components/Button";
import MessagePage from "@/components/MessagePage";
import SignInDrawer from "@/features/auth/components/SignInDrawer";
import { generateMetadata } from "@/libs/meta";

export const Route = createFileRoute("/closed-beta")({
  component: RouteComponent,
  head: () => {
    return {
      meta: generateMetadata({
        pageTitle: "βテスト",
        noindex: true,
      }),
    };
  },
});

function RouteComponent() {
  return (
    <MessagePage title="βテストの登録">
      <p>データ飛んだりしたらごめんね</p>
      <SignInDrawer>
        <Button className="mt-8 w-48">登録・ログインする</Button>
      </SignInDrawer>
    </MessagePage>
  );
}
