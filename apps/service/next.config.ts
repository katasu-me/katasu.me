import path from "node:path";
import CopyPlugin from "copy-webpack-plugin";
import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  webpack(config, { dir }) {
    config.module.rules.push({
      test: /\.svg$/i,
      use: ["@svgr/webpack"],
    });

    // WASM ファイルを .next ディレクトリにコピー
    // XXX: wasmのパス解決がうまくいかないので、一旦無理矢理やってる
    config.plugins = config.plugins || [];
    config.plugins.push(
      new CopyPlugin({
        patterns: [
          {
            from: path.join(dir, "node_modules/wasm-image-optimization/dist/esm/libImage.wasm"),
            to: path.join(dir, ".next/esm/libImage.wasm"),
          },
          {
            from: path.join(dir, "node_modules/wasm-image-optimization/dist/cjs"),
            to: path.join(dir, ".next/cjs"),
          },
        ],
      }),
    );

    // canvasモジュールの警告を回避
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };

    return config;
  },
  images: {
    unoptimized: true,
    remotePatterns: isDev
      ? [
          {
            protocol: "https",
            hostname: "local.katasu.me",
          },
          {
            protocol: "https",
            hostname: "placehold.jp",
          },
        ]
      : [],
  },
  typedRoutes: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  experimental: {
    reactCompiler: true,
    useCache: true,
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;

// added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev();
