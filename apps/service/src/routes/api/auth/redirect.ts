import { createFileRoute, redirect } from "@tanstack/react-router";
import { requireAuth } from "@/features/auth/libs/auth";

export const Route = createFileRoute("/api/auth/redirect")({
  server: {
    handlers: {
      GET: async () => {
        const { session } = await requireAuth();

        // 新規登録前なら新規登録ページへリダイレクト
        if (!session.user.name) {
          throw redirect({
            to: "/auth/signup",
          });
        }

        // ユーザーページへリダイレクト
        throw redirect({
          to: "/user/$userSlug",
          params: {
            userSlug: session.user.id,
          },
          search: {
            view: "timeline",
            page: 1,
          },
        });
      },
    },
  },
});
