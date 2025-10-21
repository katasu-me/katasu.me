"use server";

import { deleteImage, fetchImageById } from "@katasu.me/service-db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { CACHE_KEYS, invalidateCaches } from "@/lib/cache";
import { deleteImageFromR2 } from "@/lib/r2";

/**
 * 画像を削除
 * @param userId ユーザーID
 * @param imageId 画像ID
 */
export async function deleteImageAction(userId: string, imageId: string): Promise<Error | undefined> {
  const { env } = getCloudflareContext();
  const { session } = await requireAuth(env.DB);

  // 画像を取得
  const fetchImageResult = await fetchImageById(env.DB, imageId);

  if (!fetchImageResult.success) {
    return new Error("画像が見つかりません");
  }

  const prevImageData = fetchImageResult.data;

  if (!prevImageData) {
    return new Error("画像が見つかりません");
  }

  // 編集する権限があるか
  if (prevImageData.userId !== session.user.id) {
    return new Error("権限がありません");
  }

  // DBから画像を削除
  const deleteResult = await deleteImage(env.DB, imageId);

  if (!deleteResult.success) {
    console.error("[gallery] DBから画像を削除できませんでした:", deleteResult.error);
    return new Error(deleteResult.error.message);
  }

  // R2から画像を削除
  try {
    await deleteImageFromR2(env.IMAGES_R2_BUCKET, userId, imageId);
  } catch (error) {
    console.error("[gallery] R2から画像を削除できませんでした:", error);

    return error instanceof Error ? error : new Error("不明なエラーでR2からの削除に失敗しました");
  }

  // キャッシュを無効化
  const keysToInvalidate = [
    CACHE_KEYS.imageDetail(imageId), // 画像詳細
    CACHE_KEYS.userImages(userId), // ユーザーの画像一覧
    CACHE_KEYS.userImageCount(userId), // ユーザーの総画像数
  ];

  // タグに変更がある場合
  if (prevImageData.tags.length !== 0) {
    // タグ一覧
    keysToInvalidate.push(CACHE_KEYS.userTagsByUsage(userId), CACHE_KEYS.userTagsByName(userId));

    // 削除された画像のタグ別画像一覧
    for (const tag of prevImageData.tags) {
      keysToInvalidate.push(CACHE_KEYS.tagImages(tag.id));
    }
  }

  await invalidateCaches(env.CACHE_KV, keysToInvalidate);

  redirect(`/user/${userId}`);
}
