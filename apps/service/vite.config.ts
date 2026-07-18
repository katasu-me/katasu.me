import fs from "node:fs";
import path from "node:path";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";

const config = defineConfig(({ mode, command }) => ({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    cloudflare({
      viteEnvironment: { name: "ssr" },
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    svgr(),
  ],
  server:
    mode !== "production" && command === "serve"
      ? {
          host: "local.katasu.me",
          port: 3000,
          https: {
            key: fs.readFileSync(path.resolve(__dirname, "certificates/local.katasu.me-key.pem")),
            cert: fs.readFileSync(path.resolve(__dirname, "certificates/local.katasu.me.pem")),
          },
        }
      : undefined,
  build: {
    rollupOptions: {
      // server.ts経由でqueue handlerがSSRビルドに含まれるため、Worker builtinを外部化する
      external: ["cloudflare:workers"],
    },
  },
}));

export default config;
