import type { Metadata } from "next";
import { IBM_Plex_Sans_JP, Reddit_Sans } from "next/font/google";
import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { SITE_DESCRIPTION_LONG } from "@/constants/site";

import "../styles/globals.css";
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
  description: SITE_DESCRIPTION_LONG,
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
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
        {children}
      </body>
    </html>
  );
}
