"use server";

import { deleteImage, fetchImageById } from "@katasu.me/service-db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
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

  // TODO: キャッシュの削除

  // 画像ページ
  // ユーザーページ
  // タグ一覧
  // それぞれのタグページ

  // ユーザーページにリダイレクト
  redirect(`/user/${userId}`);
}
