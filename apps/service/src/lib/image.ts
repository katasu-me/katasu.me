import { BASE_URL } from "@/constants/site";

/**
 * 画像のURLを取得
 * @param userId ユーザーID
 * @param imageId 画像ID
 * @param variant 画像バリアント（デフォルト: thumbnail）
 * @returns 画像URL
 */
export function getImageUrl(userId: string, imageId: string, variant: "original" | "thumbnail" = "thumbnail"): string {
  return `${BASE_URL}/api/images/${userId}/${imageId}/${variant}`;
}

/**
 * ユーザーアバター画像のURLを取得
 * @param userId ユーザーID
 * @param hasAvatar アバター画像が存在するか
 * @returns アバター画像URL、存在しない場合はデフォルト画像
 */
export function getUserAvatarUrl(userId: string | undefined | null, hasAvatar = true): string {
  if (!userId || !hasAvatar) {
    return "/images/default-avatar-icon.avif";
  }

  return `${BASE_URL}/api/images/avatars/${userId}`;
}
