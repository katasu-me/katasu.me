"use server";

import { parseWithValibot } from "@conform-to/valibot";
import { updateUser } from "@katasu.me/service-db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { CACHE_KEYS, invalidateCache } from "@/lib/cache";
import { uploadAvatarImage } from "@/lib/r2";
import { signUpFormSchema } from "../_schemas/signup";

export async function signupAction(_prevState: unknown, formData: FormData) {
  const { env } = getCloudflareContext();
  const { session } = await requireAuth(env.DB);

  // バリデーション
  const submission = parseWithValibot(formData, {
    schema: signUpFormSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  // アバター画像がある場合
  if (submission.value.avatar instanceof File && submission.value.avatar.size > 0) {
    try {
      // 画像を変換
      const arrayBuffer = await submission.value.avatar.arrayBuffer();
      const convertedAvatar = await env.IMAGE_OPTIMIZER.generateAvatar(arrayBuffer);

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
      avatarSetAt: submission.value.avatar instanceof File ? new Date() : null,
      termsAgreedAt: new Date(),
      privacyPolicyAgreedAt: new Date(),
    });
  } catch (error) {
    console.error("[auth] ユーザー情報の更新に失敗しました:", error);

    return submission.reply({
      formErrors: ["新規登録中にエラーが発生しました"],
    });
  }

  // ユーザーデータのキャッシュを飛ばす
  await invalidateCache(env.CACHE_KV, CACHE_KEYS.user(session.user.id));

  // 成功時はユーザーページへリダイレクト
  redirect(`/user/${session.user.id}`);
}
