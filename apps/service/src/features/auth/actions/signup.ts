"use server";

import { parseWithValibot } from "@conform-to/valibot";
import { updateUser } from "@katasu.me/service-db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { generateR2Key, uploadAvatarImage } from "@/lib/r2";
import { signUpFormSchema } from "../schemas/signup-form";

export async function signupAction(_prevState: unknown, formData: FormData) {
  const { env } = getCloudflareContext();
  const { session } = await requireAuth(env.DB);

  // バリデーション
  const submission = parseWithValibot(formData, {
    schema: signUpFormSchema,
  });

  // エラーならフォームにエラーを返す
  if (submission.status !== "success") {
    return submission.reply();
  }

  // アバター画像がある場合
  if (submission.value.avatar instanceof File) {
    try {
      // 画像を変換（Service Bindings経由）
      const convertedAvatar = await env.IMAGE_OPTIMIZER.generateAvatar(submission.value.avatar);

      // 変換済み画像をアップロード
      await uploadAvatarImage(env.IMAGES_R2_BUCKET, {
        type: "avatar",
        imageBuffer: convertedAvatar,
        userId: session.user.id,
      });
    } catch (error) {
      console.error("[auth] アバター画像の処理に失敗しました:", error);

      return submission.reply({
        formErrors: ["アバター画像のアップロードに失敗しました"],
      });
    }
  }

  try {
    // ユーザー情報を更新
    await updateUser(env.DB, session.user.id, {
      name: submission.value.username,
      image: generateR2Key("avatar", session.user.id),
      termsAgreedAt: new Date(),
      privacyPolicyAgreedAt: new Date(),
    });
  } catch (error) {
    console.error("[auth] ユーザー情報の更新に失敗しました:", error);

    return submission.reply({
      formErrors: ["新規登録中にエラーが発生しました"],
    });
  }

  // 成功時はユーザーページへリダイレクト
  redirect(`/user/${session.user.id}`);
}
