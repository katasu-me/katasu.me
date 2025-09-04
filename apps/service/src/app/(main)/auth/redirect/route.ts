import { getCloudflareContext } from "@opennextjs/cloudflare";
import { redirect } from "next/navigation";
import { getAuthenticatedSession } from "@/lib/get-session";

export async function GET() {
  const { env } = getCloudflareContext();
  const session = await getAuthenticatedSession(env.DB);

  // 新規登録前ならサインアップページへリダイレクト
  if (session.user.name === "" && !session.user.image) {
    redirect("/auth/signup");
  }

  // ユーザーページへリダイレクト
  redirect(`/user/${session.user.id}`);
}
