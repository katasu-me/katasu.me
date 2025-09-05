import { getCloudflareContext } from "@opennextjs/cloudflare";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  const { env } = getCloudflareContext();
  const auth = await requireAuth(env.DB);
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // 新規登録前ならサインアップページへリダイレクト
  if (session.user.name === "" && !session.user.image) {
    redirect("/auth/signup");
  }

  // ユーザーページへリダイレクト
  redirect(`/user/${session.user.id}`);
}
