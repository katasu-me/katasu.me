"use server";

import { parseWithValibot } from "@conform-to/valibot";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { updateUser } from "@/lib/auth-client";
import { signUpFormSchema } from "../schemas/signup-form";

export async function signupAction(_prevState: unknown, formData: FormData) {
  const { env } = getCloudflareContext();

  const auth = getAuth(env.DB);
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user?.id) {
    return "ログインしてください";
  }

  const submission = parseWithValibot(formData, {
    schema: signUpFormSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  try {
    // ユーザー情報を更新
    await updateUser({
      name: submission.value.username,
    });

    // 成功時はリダイレクト
    redirect("/");
  } catch (error) {
    console.error("サインアップエラー:", error);
    return submission.reply({
      formErrors: ["ユーザー登録中にエラーが発生しました"],
    });
  }
}
