"use server";

import { parseWithValibot } from "@conform-to/valibot";
import { fetchImageById, updateImage } from "@katasu.me/service-db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { revalidateTag } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { imagePageCacheTag, tagListCacheTag, tagPageCacheTag } from "@/lib/cache-tags";
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

  const prevImageData = fetchImageResult.data;

  if (!prevImageData) {
    return submission.reply({
      formErrors: ["画像が存在しません"],
    });
  }

  if (prevImageData.userId !== userId) {
    return submission.reply({
      formErrors: ["権限がありません"],
    });
  }

  // 画像情報を更新
  const updateImageResult = await updateImage(env.DB, imageId, {
    title: title ?? null,
    tags,
  });

  if (!updateImageResult.success) {
    console.error("[gallery] 画像情報の更新に失敗しました:", updateImageResult.error);

    return submission.reply({
      formErrors: [updateImageResult.error.message],
    });
  }

  // 画像ページ
  revalidateTag(imagePageCacheTag(userId, imageId));

  // タグ一覧
  revalidateTag(tagListCacheTag(userId));

  // それぞれのタグページ
  for (const tag of updateImageResult.data.tags) {
    revalidateTag(tagPageCacheTag(userId, tag.id));
  }

  return submission.reply();
}
