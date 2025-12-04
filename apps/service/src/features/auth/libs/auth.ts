import { env } from "cloudflare:workers";
import * as schema from "@katasu.me/service-db";
import { redirect } from "@tanstack/react-router";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { reactStartCookies } from "better-auth/react-start";
import { drizzle } from "drizzle-orm/d1";
import { nanoid } from "nanoid";

export function getAuth() {
  return betterAuth({
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(drizzle(env.DB, { schema }), {
      provider: "sqlite",
    }),
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7日間
      updateAge: 60 * 60 * 24, // 24時間ごとに更新
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60,
      },
    },
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID ?? "",
        clientSecret: env.GOOGLE_CLIENT_SECRET ?? "",
      },
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            // クローズドβテストユーザーのみに制限
            // TODO: リリース時に削除
            const allowedEmailsStr = env.BETA_ALLOWED_EMAILS;

            if (allowedEmailsStr) {
              const allowedEmails = allowedEmailsStr.split(",").map((email) => email.trim().toLowerCase());

              if (!allowedEmails.includes(user.email.toLowerCase())) {
                throw new Error("クローズドβテストへの参加には招待が必要です");
              }
            }

            // ユーザー名とアイコン画像はユーザーが設定するので空にする
            return {
              data: {
                ...user,
                name: "",
                image: null,
              },
            };
          },
        },
      },
    },
    advanced: {
      database: {
        generateId: ({ size }) => {
          return nanoid(size);
        },
      },
    },
    plugins: [reactStartCookies()],
  });
}

/**
 * ユーザーのセッションを取得
 * @param db D1Database
 * @return セッション
 */
export async function getUserSession() {
  const auth = getAuth();
  const headers = getRequestHeaders();

  const session = await auth.api.getSession({
    headers,
  });

  return { auth, session };
}

/**
 * 認証を要求してセッション情報を取得する
 * 認証されていない場合はトップへリダイレクトする
 * @param db D1Database
 * @return BetterAuthインスタンス, セッション情報
 */
export async function requireAuth(): Promise<{
  auth: ReturnType<typeof getAuth>;
  session: NonNullable<Awaited<ReturnType<ReturnType<typeof getAuth>["api"]["getSession"]>>>;
}> {
  const { auth, session } = await getUserSession();

  // アカウントが存在しない場合はトップへリダイレクト
  if (!session || !session.user?.id) {
    throw redirect({
      to: "/",
    });
  }

  return { auth, session };
}
