import { SITE_DESCRIPTION_LONG, SITE_NAME } from "@/constants/site";
import type { Metadata } from "next";
import { IBM_Plex_Sans_JP } from "next/font/google";
import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import "./globals.css";

const ibmPlexSansJP = IBM_Plex_Sans_JP({
  variable: "--font-ibm-plex-sans-jp",
  weight: ["400", "700"],
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: SITE_NAME,
  description: SITE_DESCRIPTION_LONG,
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ja">
      <body className={twMerge(ibmPlexSansJP.variable, "antialiased")}>{children}</body>
    </html>
  );
}
