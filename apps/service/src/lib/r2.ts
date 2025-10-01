/**
 * R2バケットのパブリックURLを取得
 * @returns R2バケットのパブリックURL
 * @throws 環境変数が設定されていない場合にエラーをスロー
 */
function getBucketPublicUrl(): string {
  const bucketPublicUrl = process.env.R2_PUBLIC_URL;

  if (!bucketPublicUrl) {
    throw new Error("R2_PUBLIC_URLが設定されていません");
  }

  return bucketPublicUrl;
}

/**
 * ユーザーのアバターURLを取得
 * @param userId ユーザーID
 * @param hasAvatar アバターが設定されているかどうか
 * @returns アバターURL
 */
export function getUserAvatarUrl(userId: string, hasAvatar: boolean): string {
  const bucketPublicUrl = getBucketPublicUrl();

  if (hasAvatar) {
    return `${bucketPublicUrl}/avatars/${userId}.avif`;
  }

  return "/images/default-avatar-icon.avif";
}

/**
 * 画像のURLを取得
 * @param userId ユーザーID
 * @param imageId 画像ID
 * @param variant 画像バリアント（デフォルト: thumbnail）
 * @returns 画像URL
 */
export function getImageUrl(userId: string, imageId: string, variant: "original" | "thumbnail" = "thumbnail"): string {
  const bucketPublicUrl = getBucketPublicUrl();
  const suffix = variant === "thumbnail" ? "_thumbnail" : "";
  return `${bucketPublicUrl}/images/${userId}/${imageId}${suffix}.avif`;
}
