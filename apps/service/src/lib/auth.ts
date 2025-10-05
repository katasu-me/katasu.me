import * as schema from "@katasu.me/service-db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { drizzle } from "drizzle-orm/d1";
import { nanoid } from "nanoid";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const getAuth = (db: D1Database) => {
  return betterAuth({
    baseURL: process.env.BETTER_AUTH_URL,
    database: drizzleAdapter(drizzle(db, { schema }), {
      provider: "sqlite",
    }),
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60,
      },
    },
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID ?? "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      },
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
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
    plugins: [nextCookies()],
  });
};

/**
 * ユーザーのセッションを取得
 * @param db D1Database
 * @return セッション
 */
export async function getUserSession(db: D1Database) {
  const auth = getAuth(db);
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return { auth, session };
}

/**
 * 認証を要求してセッション情報を取得する
 * 認証されていない場合はトップへリダイレクトする
 * @param db D1Database
 * @return BetterAuthインスタンス, セッション情報
 */
export async function requireAuth(db: D1Database) {
  const { auth, session } = await getUserSession(db);

  // アカウントが存在しない場合はトップへリダイレクト
  if (!session || !session.user?.id) {
    redirect("/");
  }

  return { auth, session };
}
