import { env } from "cloudflare:workers";
import { createFileRoute, notFound } from "@tanstack/react-router";

export const Route = createFileRoute("/api/r2/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const isDev = import.meta.env.MODE === "development";
        const isLocalhost =
          env.BETTER_AUTH_URL?.includes("localhost") || env.BETTER_AUTH_URL?.includes("local.katasu.me");

        // 本番なら404に
        if (!isDev || !isLocalhost) {
          throw notFound();
        }

        // パスが空
        if (!params._splat) {
          throw notFound();
        }

        try {
          const object = await env.IMAGES_R2_BUCKET.get(params._splat);

          if (!object) {
            console.log("[DEV] File not found in R2 with key:", params._splat);
            throw notFound();
          }

          return new Response(object.body);
        } catch (error) {
          console.error("[DEV] Error fetching file from R2:", error);
          return new Response("Error fetching file", { status: 500 });
        }
      },
    },
  },
});
