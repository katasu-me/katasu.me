"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";

/**
 * 認証済みセッションを取得する
 * 認証されていない場合はトップへリダイレクトする
 * @param db D1Database
 * @return セッション情報
 */
export async function getAuthenticatedSession(db: D1Database) {
  const auth = getAuth(db);
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // アカウントが存在しない場合はトップへリダイレクト
  if (!session || !session.user?.id) {
    redirect("/");
  }

  return session;
}
