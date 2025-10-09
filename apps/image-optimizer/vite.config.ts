import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    dts({
      entryRoot: "./src",
      outDir: "./dist/types",
      include: ["src/index.ts"],
      rollupTypes: true,
      insertTypesEntry: true,
      skipDiagnostics: false,
      logDiagnostics: false,
    }),
  ],
  build: {
    lib: {
      entry: "./src/index.ts",
      formats: ["es"],
      fileName: "index",
    },
    outDir: "./dist",
  },
});
