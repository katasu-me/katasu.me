"use server";

import { parseWithValibot } from "@conform-to/valibot";
import { deleteUser } from "@katasu.me/service-db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { requireAuth } from "@/lib/auth";
import { deleteUserDataFromR2 } from "@/lib/r2";
import { deleteAccountSchema } from "../_schemas/delete-account";

export async function deleteAccountAction(_prevState: unknown, formData: FormData) {
  const { env, ctx } = getCloudflareContext();
  const { session } = await requireAuth(env.DB);

  // バリデーション
  const submission = parseWithValibot(formData, {
    schema: deleteAccountSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const userId = session.user.id;

  // DBからユーザーを削除
  try {
    const deleteResult = await deleteUser(env.DB, userId);

    if (!deleteResult.success) {
      console.error("[delete-account] ユーザーの削除に失敗しました:", deleteResult.error);

      return submission.reply({
        formErrors: ["アカウントの削除中にエラーが発生しました"],
      });
    }
  } catch (error) {
    console.error("[delete-account] ユーザーの削除に失敗しました:", error);

    return submission.reply({
      formErrors: ["アカウントの削除中にエラーが発生しました"],
    });
  }

  // R2からユーザーデータを削除
  ctx.waitUntil(deleteUserDataFromR2(env.IMAGES_R2_BUCKET, userId));

  return submission.reply();
}
