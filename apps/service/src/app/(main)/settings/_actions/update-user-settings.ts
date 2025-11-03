"use server";

import { parseWithValibot } from "@conform-to/valibot";
import { type User, updateUser } from "@katasu.me/service-db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { requireAuth } from "@/lib/auth";
import { CACHE_KEYS, invalidateCache } from "@/lib/cache";
import { uploadAvatarImage } from "@/lib/r2";
import { userSettingsFormSchema } from "../_schemas/user-settings";

export async function updateUserSettingsAction(_prevState: unknown, formData: FormData) {
  const { env } = getCloudflareContext();
  const { session } = await requireAuth(env.DB);

  const submission = parseWithValibot(formData, {
    schema: userSettingsFormSchema,
  });

  // バリデーションエラーを返す
  if (submission.status !== "success") {
    return submission.reply();
  }

  const updateData: Partial<Pick<User, "name" | "avatarSetAt">> = {};

  // ユーザー名を更新
  updateData.name = submission.value.username;

  // アバター画像を削除
  if (submission.value.removeAvatar) {
    updateData.avatarSetAt = null;
  }
  // アバター画像を変更
  else if (submission.value.avatar instanceof File && submission.value.avatar.size > 0) {
    try {
      const arrayBuffer = await submission.value.avatar.arrayBuffer();
      const convertedAvatar = await env.IMAGE_OPTIMIZER.generateAvatar(arrayBuffer);

      await uploadAvatarImage(env.IMAGES_R2_BUCKET, {
        type: "avatar",
        imageBuffer: convertedAvatar,
        userId: session.user.id,
      });

      updateData.avatarSetAt = new Date();
    } catch (error) {
      console.error("[auth] アバター画像の処理に失敗しました:", error);

      return submission.reply({
        formErrors: ["アバター画像のアップロードに失敗しました"],
      });
    }
  }

  // ユーザー情報を更新
  try {
    await updateUser(env.DB, session.user.id, updateData);
  } catch (error) {
    console.error("[update-user-data] ユーザー情報の更新に失敗しました:", error);

    return submission.reply({
      formErrors: ["ユーザー情報の更新中にエラーが発生しました"],
    });
  }

  // ユーザーデータのキャッシュを飛ばす
  invalidateCache(env.CACHE_KV, CACHE_KEYS.user(session.user.id));

  return submission.reply();
}
