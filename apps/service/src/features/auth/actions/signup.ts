"use server";

import { parseWithValibot } from "@conform-to/valibot";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { uploadAvatarImage } from "@/lib/r2";
import { signUpFormSchema } from "../schemas/signup-form";

export async function signupAction(_prevState: unknown, formData: FormData) {
  const { env } = getCloudflareContext();
  const { auth, session } = await requireAuth(env.DB);

  // バリデーション
  const submission = parseWithValibot(formData, {
    schema: signUpFormSchema,
  });

  // エラーならフォームにエラーを返す
  if (submission.status !== "success") {
    return submission.reply();
  }

  let avatarUrl: string | undefined;

  // アバター画像がある場合
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
    const result = await auth.api.updateUser({
      body: {
        name: submission.value.username,
        image: avatarUrl,
      },
      headers: await headers(),
    });

    if (!result.status) {
      console.error("ユーザー情報更新エラー");

      return submission.reply({
        formErrors: ["ユーザー情報の更新中にエラーが発生しました"], // TODO: 詳細なエラー内容を表示するか検討
      });
    }

    console.log("ユーザー更新結果:", result);
  } catch (error) {
    console.error("新規登録エラー:", error);

    return submission.reply({
      formErrors: ["新規登録中にエラーが発生しました"],
    });
  }

  // 成功時はユーザーページへリダイレクト
  redirect(`/user/${session.user.id}`);
}
