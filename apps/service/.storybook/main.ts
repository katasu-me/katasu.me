import type { StorybookConfig } from "@storybook/react-vite";
import type { PluginOption } from "vite";

// Storybook はコンポーネント単体をブラウザ向けにビルドするだけなので、Workers 環境やルーティングのビルド処理は不要。
// vite.config.ts をそのまま継承すると TanStack Start の manifest 生成が Storybook のエントリを
// 「複数エントリ」とみなしてビルドが失敗するため、これらのプラグインを除外する
const EXCLUDED_PLUGIN_PREFIXES = ["vite-plugin-cloudflare", "tanstack"];

const flattenPlugins = async (plugins: PluginOption[]): Promise<PluginOption[]> => {
  const resolved = await Promise.all(plugins.map(async (plugin) => await plugin));
  const nested = await Promise.all(
    resolved.map((plugin) => (Array.isArray(plugin) ? flattenPlugins(plugin) : Promise.resolve([plugin]))),
  );
  return nested.flat();
};

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@storybook/addon-links", "storybook-addon-pseudo-states", "@storybook/addon-docs"],
  framework: "@storybook/react-vite",
  staticDirs: ["../public"],
  viteFinal: async (config) => {
    const plugins = await flattenPlugins(config.plugins ?? []);
    config.plugins = plugins.filter(
      (plugin) =>
        !(
          plugin &&
          typeof plugin === "object" &&
          "name" in plugin &&
          EXCLUDED_PLUGIN_PREFIXES.some((prefix) => plugin.name.startsWith(prefix))
        ),
    );
    return config;
  },
};
export default config;
