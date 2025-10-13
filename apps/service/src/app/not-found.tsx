import type { Metadata } from "next";
import BudouX from "@/components/BudouX";
import MessagePage from "@/components/MessagePage";
import { generateMetadataTitle } from "@/lib/meta";

export const metadata: Metadata = generateMetadataTitle({
  pageTitle: "ページが見つかりませんでした",
  noindex: true,
});

export default function NotFound() {
  return (
    <MessagePage title="404" showBackButton>
      <p>
        <BudouX>ページが見つかりませんでした。</BudouX>
      </p>
      <p className="mt-2">
        <BudouX>ページが移動されたか、削除されたのかもしれません。</BudouX>
      </p>
    </MessagePage>
  );
}
