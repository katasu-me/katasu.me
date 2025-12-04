/// <reference types="vite-plugin-svgr/client" />

declare global {
  interface Window {
    Tally?: {
      loadEmbeds: () => void;
    };
  }
}

export {};
