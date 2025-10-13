"use client";

import MessagePage from "@/components/MessagePage";

export default function GlobalError() {
  return (
    <html lang="ja">
      <body className="bg-primary-background text-primary-foreground">
        <MessagePage title="Error">
          <p>サーバーでエラーが発生しました</p>
          <p className="mt-2">しばらく時間をおいて、再度お試しください 🙇</p>
        </MessagePage>
      </body>
    </html>
  );
}
