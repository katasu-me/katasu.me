import type { Preview } from "@storybook/nextjs";
import { IBM_Plex_Sans_JP, Reddit_Sans } from "next/font/google";
import "../src/styles/globals.css";
import { twJoin } from "tailwind-merge";

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

const preview: Preview = {
  decorators: [
    (Story) => (
      <div className={twJoin(ibmPlexSansJP.className, redditMono.className)}>
        <Story />
        {/* Portal内にフォントを適用するため */}
        <style>
          {`
            body {
              font-family: "Reddit Sans", ${ibmPlexSansJP.style.fontFamily};
            }
          `}
        </style>
      </div>
    ),
  ],
};

export default preview;
