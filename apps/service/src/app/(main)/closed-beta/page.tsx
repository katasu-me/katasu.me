import SignInDrawer from "@/app/_components/SignInDrawer";
import Button from "@/components/Button";
import MessagePage from "@/components/MessagePage";

export default function ClosedBetaPage() {
  return (
    <MessagePage title="βテストの登録">
      <p>データ飛んだりしたらごめんね</p>
      <SignInDrawer>
        <Button className="mt-8 w-48">登録・ログインする</Button>
      </SignInDrawer>
    </MessagePage>
  );
}
