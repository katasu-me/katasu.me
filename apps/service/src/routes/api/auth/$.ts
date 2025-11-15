import { env } from "cloudflare:workers";
import { createFileRoute } from "@tanstack/react-router";
import { getAuth } from "@/features/auth/libs/auth";

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const auth = getAuth(env.DB);
        return auth.handler(request);
      },
      POST: ({ request }) => {
        const auth = getAuth(env.DB);
        return auth.handler(request);
      },
    },
  },
});
