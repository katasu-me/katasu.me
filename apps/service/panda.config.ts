import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  preflight: true,
  include: ["./src/**/*.{ts,tsx}"],
  outdir: "styled-system",
  globalVars: {
    "--grid-main-layout": "1fr min(768px, 100% - 2.5rem) 1fr",
  },
  theme: {
    extend: {
      breakpoints: {
        pc: "768px",
      },
      tokens: {
        colors: {
          "warm-black": { value: "rgb(72, 48, 48)" },
          "warm-black-10": { value: "rgb(242, 240, 240)" },
          "warm-black-25": { value: "rgb(223, 215, 215)" },
          "warm-black-50": { value: "rgb(163, 150, 150)" },
          "warm-white": { value: "rgb(254, 251, 251)" },
          "warm-green": { value: "rgb(115, 134, 45)" },
          "vivid-yellow": { value: "rgb(255, 218, 11)" },
          "vivid-red": { value: "rgb(255, 52, 11)" },
        },
        easings: {
          magnetic: { value: "cubic-bezier(0.16, 1, 0.3, 1)" },
        },
        lineHeights: {
          "3": { value: "0.75rem" },
          "4": { value: "1rem" },
          "5": { value: "1.25rem" },
          "6": { value: "1.5rem" },
          "7": { value: "1.75rem" },
          "8": { value: "2rem" },
          "9": { value: "2.25rem" },
          "10": { value: "2.5rem" },
        },
        zIndex: {
          overlay: { value: 1 },
          dropdown: { value: 50 },
          floating: { value: 2147483647 },
        },
      },
    },
  },
  globalCss: {
    body: {
      fontFamily: '"Reddit Sans Variable", "IBM Plex Sans JP", BlinkMacSystemFont, sans-serif',
      WebkitFontSmoothing: "antialiased",
      MozOsxFontSmoothing: "grayscale",
      backgroundImage: "radial-gradient(token(colors.warm-black-10) 1px, transparent 1px)",
      backgroundSize: "16px 16px",
    },
    ".interactive-base": {
      transition: "all 400ms token(easings.magnetic)",
    },
    ".interactive-scale": {
      transition: "all 400ms token(easings.magnetic)",
      _hover: {
        transform: "scale(1.05)",
      },
      _active: {
        transform: "scale(0.95)",
      },
    },
    ".interactive-scale-sm": {
      transition: "all 400ms token(easings.magnetic)",
      _hover: {
        transform: "scale(1.01)",
      },
      _active: {
        transform: "scale(0.99)",
      },
    },
    ".interactive-scale-brightness": {
      transition: "all 400ms token(easings.magnetic)",
      _hover: {
        transform: "scale(1.05)",
        filter: "brightness(0.9)",
      },
      _active: {
        transform: "scale(0.95)",
      },
    },
  },
});
