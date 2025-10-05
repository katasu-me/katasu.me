/**
 * ユーザーページのキャッシュタグを生成
 */
export function userPageCacheTag(userId: string): string {
  return `/user/${userId}`;
}

/**
 * タグページのキャッシュタグを生成
 */
export function tagPageCacheTag(userId: string, tagId: string): string {
  return `/user/${userId}/tag/${tagId}`;
}

/**
 * 画像ページのキャッシュタグを生成
 */
export function imagePageCacheTag(userId: string, imageId: string): string {
  return `/user/${userId}/image/${imageId}`;
}
