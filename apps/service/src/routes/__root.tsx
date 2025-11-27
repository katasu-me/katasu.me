import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import type { PropsWithChildren } from "react";
import BudouX from "@/components/BudouX";
import MessagePage from "@/components/MessagePage";
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
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "preconnect",
        href: import.meta.env.VITE_IMAGE_R2_URL,
      },
    ],
  }),

  errorComponent: ErrorComponent,
  notFoundComponent: NotFound,
  shellComponent: RootDocument,
});

function ErrorComponent() {
  return (
    <MessagePage title="Error" showBackButton>
      <p>サーバーでエラーが発生しました</p>
      <p className="mt-2">しばらく時間をおいて、再度お試しください 🙇</p>
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
        {children}
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
        {/*         {process.env.VITE_UMAMI_SCRIPT_URL && process.env.VITE_UMAMI_WEBSITE_ID && ( */}
        {/*   <Script */}
        {/*     src={process.env.VITE_UMAMI_SCRIPT_URL} */}
        {/*     data-website-id={process.env.VITE_UMAMI_WEBSITE_ID} */}
        {/*     strategy="lazyOnload" */}
        {/*   /> */}
        {/* )} */}
        <Scripts />
      </body>
    </html>
  );
}
