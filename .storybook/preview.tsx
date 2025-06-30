import type { Preview } from "@storybook/nextjs";
import { IBM_Plex_Sans_JP } from "next/font/google";
import "../src/styles/globals.css";
import "../src/styles/media-queries.css";

const ibmPlexSansJP = IBM_Plex_Sans_JP({
  variable: "--font-ibm-plex-sans-jp",
  weight: ["400", "700"],
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const preview: Preview = {
  decorators: [
    (Story) => (
      <div className={ibmPlexSansJP.className}>
        <Story />
        {/* Portal内にフォントを適用するため */}
        <style>
          {`
            body {
              font-family: ${ibmPlexSansJP.style.fontFamily};
            }
          `}
        </style>
      </div>
    ),
  ],
};

export default preview;
