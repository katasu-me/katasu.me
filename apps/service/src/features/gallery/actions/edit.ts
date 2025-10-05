"use server";

import { parseWithValibot } from "@conform-to/valibot";
import { fetchImageById, updateImage } from "@katasu.me/service-db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { revalidateTag } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { imagePageCacheTag, tagPageCacheTag } from "@/lib/cache-tags";
import { editImageSchema } from "../schemas/edit";

export async function editImageAction(_prevState: unknown, formData: FormData) {
  const { env } = getCloudflareContext();
  const { session } = await requireAuth(env.DB);

  const submission = parseWithValibot(formData, {
    schema: editImageSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const userId = session.user.id;
  const { imageId, title, tags } = submission.value;

  // 画像を取得
  const fetchImageResult = await fetchImageById(env.DB, imageId);

  if (!fetchImageResult.success) {
    return submission.reply({
      formErrors: ["画像の取得に失敗しました"],
    });
  }

  if (!fetchImageResult.data) {
    return submission.reply({
      formErrors: ["画像が存在しません"],
    });
  }

  if (fetchImageResult.data.userId !== userId) {
    return submission.reply({
      formErrors: ["権限がありません"],
    });
  }

  console.log(userId, title, tags);

  // 画像情報を更新
  const updateImageResult = await updateImage(env.DB, imageId, {
    title: title ?? null,
    tags,
  });

  if (!updateImageResult.success) {
    console.error("Update image error:", updateImageResult.error);

    return submission.reply({
      formErrors: [updateImageResult.error.message],
    });
  }

  // キャッシュを無効化
  revalidateTag(imagePageCacheTag(userId, imageId));

  // タグページのキャッシュを無効化
  for (const tag of updateImageResult.data.tags) {
    revalidateTag(tagPageCacheTag(userId, tag.id));
  }

  return submission.reply();
}
