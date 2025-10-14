import { defineCloudflareConfig, type OpenNextConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import doQueue from "@opennextjs/cloudflare/overrides/queue/do-queue";
import doShardedTagCache from "@opennextjs/cloudflare/overrides/tag-cache/do-sharded-tag-cache";

const config = {
  ...defineCloudflareConfig({
    incrementalCache: r2IncrementalCache,
    tagCache: doShardedTagCache({ baseShardSize: 12, regionalCache: true }),
    queue: doQueue,
  }),
  functions: {
    images: {
      runtime: "edge",
      routes: ["app/api/images/[userId]/[imageId]/[variant]/route"],
      patterns: ["api/images"],
    },
    avatarImages: {
      runtime: "edge",
      routes: ["app/api/images/avatars/[userId]/route"],
      patterns: ["api/images/avatars"],
    },
  },
} satisfies OpenNextConfig;

export default config;
