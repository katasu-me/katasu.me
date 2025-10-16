"use server";

import { parseWithValibot } from "@conform-to/valibot";
import { fetchImageById, updateImage } from "@katasu.me/service-db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { requireAuth } from "@/lib/auth";
import { CACHE_KEYS, invalidateCaches } from "@/lib/cache";
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

  // キャッシュを無効化
  const keysToInvalidate = [
    CACHE_KEYS.imageDetail(imageId), // 画像詳細
  ];

  const prevTags = prevImageData.tags || [];
  const prevTagIds = new Set(prevTags.map((t) => t.id));

  const newTags = updateImageResult.data?.tags || [];
  const newTagIds = new Set(newTags.map((t) => t.id));

  // タグに変更があった場合、タグ一覧も無効化
  const tagsChanged = prevTags.length !== newTags.length || prevTags.some((tag) => !newTagIds.has(tag.id));
  if (tagsChanged) {
    keysToInvalidate.push(CACHE_KEYS.userTagsByUsage(userId), CACHE_KEYS.userTagsByName(userId));
  }

  // 削除されたタグ
  for (const tag of prevTags) {
    if (!newTagIds.has(tag.id)) {
      keysToInvalidate.push(CACHE_KEYS.tagImages(tag.id));
    }
  }

  // 追加されたタグ
  for (const tag of newTags) {
    if (!prevTagIds.has(tag.id)) {
      keysToInvalidate.push(CACHE_KEYS.tagImages(tag.id));
    }
  }

  await invalidateCaches(env.CACHE_KV, keysToInvalidate);

  return submission.reply();
}
