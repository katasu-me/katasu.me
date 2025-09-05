import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { nanoid } from "nanoid";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getDB } from "./db";

export const getAuth = (db: D1Database) => {
  return betterAuth({
    baseURL: process.env.BETTER_AUTH_URL,
    database: drizzleAdapter(getDB(db), {
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
 * 認証を要求してセッション情報を取得する
 * 認証されていない場合はトップへリダイレクトする
 * @param db D1Database
 * @return BetterAuthインスタンス, セッション情報
 */
export async function requireAuth(db: D1Database) {
  const auth = getAuth(db);
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // アカウントが存在しない場合はトップへリダイレクト
  if (!session || !session.user?.id) {
    redirect("/");
  }

  return { auth, session };
}
