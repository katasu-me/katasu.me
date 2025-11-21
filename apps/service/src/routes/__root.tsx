import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import type { PropsWithChildren } from "react";
import BudouX from "@/components/BudouX";
import MessagePage from "@/components/MessagePage";
import { generateMetadataTitle } from "@/libs/meta";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      ...generateMetadataTitle(),
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

  notFoundComponent: NotFound,
  shellComponent: RootDocument,
});

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
