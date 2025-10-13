import type { Metadata } from "next";
import { IBM_Plex_Sans_JP, Reddit_Sans } from "next/font/google";
import { headers } from "next/headers";
import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { SITE_DESCRIPTION_LONG, SITE_NAME, SITE_URL } from "@/constants/site";

import "../styles/globals.css";
import { DeviceProvider } from "@/contexts/DeviceContext";
import { generateMetadataTitle } from "@/lib/meta";

const ibmPlexSansJP = IBM_Plex_Sans_JP({
  weight: ["400", "700"],
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const redditMono = Reddit_Sans({
  weight: ["400"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  ...generateMetadataTitle(),
  metadataBase: new URL(SITE_URL),
  description: SITE_DESCRIPTION_LONG,
  openGraph: {
    description: SITE_DESCRIPTION_LONG,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
  },
  twitter: {
    description: SITE_DESCRIPTION_LONG,
  },
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const headersList = await headers();
  const isDesktop = headersList.get("X-IS-DESKTOP") === "true";

  return (
    <html lang="ja">
      <body
        className={twMerge(
          ibmPlexSansJP.className,
          redditMono.className,
          "grid grid-cols-(--grid-main-layout) bg-warm-white font-mix text-warm-black",
        )}
        style={{
          fontFamily: `"Reddit Sans", ${ibmPlexSansJP.style.fontFamily}`,
        }}
      >
        <DeviceProvider isDesktop={isDesktop}>{children}</DeviceProvider>
      </body>
    </html>
  );
}
