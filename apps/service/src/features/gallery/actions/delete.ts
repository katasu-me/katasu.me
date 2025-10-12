"use server";

import { deleteImage, fetchImageById } from "@katasu.me/service-db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { tagListCacheTag, tagPageCacheTag, userPageCacheTag } from "@/lib/cache-tags";
import { deleteImageFromR2 } from "@/lib/r2";

/**
 * 画像を削除
 * @param userId ユーザーID
 * @param imageId 画像ID
 */
export async function deleteImageAction(userId: string, imageId: string): Promise<Error | undefined> {
  const { env } = getCloudflareContext();
  const { session } = await requireAuth(env.DB);

  // 自分の画像でない場合はエラー
  if (session.user.id !== userId) {
    return new Error("権限がありません");
  }

  // 画像を取得
  const fetchImageResult = await fetchImageById(env.DB, imageId);

  if (!fetchImageResult.success) {
    return new Error("画像が見つかりません");
  }

  const prevImageData = fetchImageResult.data;

  if (!prevImageData) {
    return new Error("画像が見つかりません");
  }

  // DBから画像を削除
  const deleteResult = await deleteImage(env.DB, imageId);

  if (!deleteResult.success) {
    console.error("Delete image error:", deleteResult.error);
    return new Error(deleteResult.error.message);
  }

  // R2から画像を削除
  try {
    await deleteImageFromR2(env.IMAGES_R2_BUCKET, userId, imageId);
  } catch (error) {
    console.error("Delete image from R2 error:", error);

    return error instanceof Error ? error : new Error("不明なエラーでR2からの削除に失敗しました");
  }

  // 画像ページ
  revalidateTag(userPageCacheTag(userId));

  // タグ一覧
  revalidateTag(tagListCacheTag(userId));

  // それぞれのタグページ
  for (const tag of prevImageData.tags) {
    revalidateTag(tagPageCacheTag(userId, tag.id));
  }

  // ユーザーページにリダイレクト
  redirect(`/user/${userId}`);
}
