import path from "node:path";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import viteTsConfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    react(),
    viteTsConfigPaths(),
    svgr({
      svgrOptions: {
        exportType: "default",
      },
    }),
  ],
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
