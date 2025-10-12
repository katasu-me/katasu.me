/**
 * ユーザーデータのキャッシュタグ
 */
export function userDataCacheTag(userId: string): string {
  return `user-${userId}`;
}

/**
 * ユーザーページのキャッシュタグ
 */
export function userPageCacheTag(userId: string): string {
  return `/user/${userId}`;
}

/**
 * タグ一覧に関連するキャッシュタグ
 */
export function tagListCacheTag(userId: string): string {
  return `/user/${userId}/tag`;
}

/**
 * タグページのキャッシュタグ
 */
export function tagPageCacheTag(userId: string, tagId: string): string {
  return `/user/${userId}/tag/${tagId}`;
}

/**
 * 画像ページのキャッシュタグ
 */
export function imagePageCacheTag(userId: string, imageId: string): string {
  return `/user/${userId}/image/${imageId}`;
}
