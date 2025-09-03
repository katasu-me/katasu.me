"use server";

import { parseWithValibot } from "@conform-to/valibot";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { updateUser } from "@/lib/auth-client";
import { uploadAvatarImage } from "@/lib/r2";
import { signUpFormSchema } from "../schemas/signup-form";

export async function signupAction(_prevState: unknown, formData: FormData) {
  const { env } = getCloudflareContext();

  const auth = getAuth(env.DB);
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user?.id) {
    redirect("/");
  }

  // バリデーション
  const submission = parseWithValibot(formData, {
    schema: signUpFormSchema,
  });

  // エラーならフォームにエラーメッセージを返す
  if (submission.status !== "success") {
    return submission.reply();
  }

  let avatarUrl: string | undefined;

  // アバター画像がある場合;
  if (submission.value.avatar instanceof File) {
    try {
      const arrayBuffer = await submission.value.avatar.arrayBuffer();

      await uploadAvatarImage(env.IMAGES_R2_BUCKET, {
        type: "avatar",
        imageBuffer: arrayBuffer,
        userId: session.user.id,
      });
    } catch (error) {
      console.error("アバター画像の処理エラー:", error);

      return submission.reply({
        formErrors: ["アバター画像のアップロードに失敗しました"],
      });
    }
  }

  try {
    // ユーザー名とアバターURLを更新
    await updateUser({
      name: submission.value.username,
      image: avatarUrl,
    });
  } catch (error) {
    console.error("新規登録エラー:", error);

    return submission.reply({
      formErrors: ["新規登録中にエラーが発生しました"],
    });
  }

  // 成功時はリダイレクト
  redirect(`/user/${session.user.id}`);
}
