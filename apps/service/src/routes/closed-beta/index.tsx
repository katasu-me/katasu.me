import { createFileRoute } from "@tanstack/react-router";
import Button from "@/components/Button";
import MessagePage from "@/components/MessagePage";
import SignInDrawer from "@/features/auth/components/SignInDrawer";

export const Route = createFileRoute("/closed-beta/")({
  component: RouteComponent,
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
