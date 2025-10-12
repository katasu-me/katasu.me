import type { Metadata } from "next";
import ErrorPage from "@/components/ErrorPage";
import { generateMetadataTitle } from "@/lib/meta";

export const metadata: Metadata = generateMetadataTitle({
  pageTitle: "認証に失敗しました",
  noindex: true,
});

export default function AuthErrorPage() {
  return (
    <ErrorPage title="Error" showBackButton>
      <p>認証に失敗しました</p>
      <p>しばらく時間をおいて、再度お試しください 🙇</p>
    </ErrorPage>
  );
}
