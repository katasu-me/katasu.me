import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import type { PropsWithChildren } from "react";
import BudouX from "@/components/BudouX";
import MessagePage from "@/components/MessagePage";
import UploadDrawer from "@/features/image-upload/components/UploadDrawer";
import UploadSnackbar from "@/features/image-upload/components/UploadSnackbar";
import { UploadProvider } from "@/features/image-upload/contexts/UploadContext";
import { generateMetadata } from "@/libs/meta";
import appCss from "../styles.css?url";

type RouterContext = {
  queryClient: QueryClient;
};

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      ...generateMetadata(),
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: import.meta.env.VITE_IMAGE_R2_URL },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
      { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
      { rel: "manifest", href: "/site.webmanifest" },
      { rel: "icon", href: "/favicon.ico" },
    ],
    scripts: [
      import.meta.env.VITE_UMAMI_SCRIPT_URL && import.meta.env.VITE_UMAMI_WEBSITE_ID
        ? {
            src: import.meta.env.VITE_UMAMI_SCRIPT_URL,
            "data-website-id": import.meta.env.VITE_UMAMI_WEBSITE_ID,
            defer: true,
          }
        : undefined,
    ],
  }),

  errorComponent: ErrorComponent,
  notFoundComponent: NotFound,
  shellComponent: RootDocument,
});

function ErrorComponent() {
  return (
    <MessagePage title="Error" showBackButton>
      <p>エラーが発生しました</p>
      <p className="mt-2">ページを再読み込みしてみてください…</p>
    </MessagePage>
  );
}

function NotFound() {
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

function RootDocument({ children }: PropsWithChildren) {
  return (
    <html lang="ja">
      <head>
        <HeadContent />
      </head>
      <body className="grid grid-cols-(--grid-main-layout) bg-warm-white font-mix text-warm-black">
        <UploadProvider>
          <UploadSnackbar />
          <UploadDrawer />
          {children}
        </UploadProvider>
        {import.meta.env.DEV && (
          <TanStackDevtools
            config={{
              position: "bottom-right",
            }}
            plugins={[
              {
                name: "Tanstack Router",
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
        )}
        <Scripts />
      </body>
    </html>
  );
}
