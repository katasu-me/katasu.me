import type { ImageVariants } from "./types";

/**
 * R2のキーを生成
 */
export function generateR2Key(userId: string, imageId: string, variant: "original" | "thumbnail"): string {
  const baseKey = `images/${userId}/${imageId}`;
  return variant === "thumbnail" ? `${baseKey}_thumbnail.webp` : `${baseKey}.webp`;
}

/**
 * 画像のURLを生成
 */
export function getImageUrl(baseUrl: string, userId: string, imageId: string): string {
  return `${baseUrl}/${generateR2Key(userId, imageId, "original")}`;
}

/**
 * 画像をR2にアップロード
 */
export async function uploadImages(
  r2: R2Bucket,
  userId: string,
  imageId: string,
  variants: ImageVariants,
): Promise<{ originalKey: string; thumbnailKey: string }> {
  const originalKey = generateR2Key(userId, imageId, "original");
  const thumbnailKey = generateR2Key(userId, imageId, "thumbnail");

  await Promise.all([
    r2.put(originalKey, variants.original, {
      httpMetadata: { contentType: "image/webp" },
    }),
    r2.put(thumbnailKey, variants.thumbnail, {
      httpMetadata: { contentType: "image/webp" },
    }),
  ]);

  return { originalKey, thumbnailKey };
}

/**
 * 画像をR2から削除
 */
export async function deleteImages(r2: R2Bucket, originalKey: string, thumbnailKey: string): Promise<void> {
  await r2.delete([originalKey, thumbnailKey]);
}
