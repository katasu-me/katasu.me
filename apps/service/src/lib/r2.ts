import type { ImageVariants } from "image-optimizer";

type UploadAvatarImageOptions = {
  type: "avatar";
  imageBuffer: ArrayBuffer;
  userId: string;
};

type UploadImageOptions = {
  type: "image";
  variants: Pick<ImageVariants, "original" | "thumbnail">;
  userId: string;
  imageId: string;
};

// 内部的にR2へアップロードする際の型
type UploadToR2Options = {
  imageBuffer: ArrayBuffer;
  userId: string;
  imageId?: string;
};

/**
 * パスコンポーネントをサニタイズ
 * @param input サニタイズ対象の文字列
 * @returns サニタイズされた文字列
 */
function sanitizePathComponent(input: string): string {
  // 英数字、アンダースコア、ハイフンのみ許可
  return input.replace(/[^a-zA-Z0-9_-]/g, "");
}

/**
 * R2のキーを生成
 * @returns R2のキー
 */
export function generateR2Key(
  type: "avatar" | "image",
  userId: string,
  imageId?: string,
  variant?: "original" | "thumbnail",
): string {
  const safeUserId = sanitizePathComponent(userId);
  const safeImageId = imageId ? sanitizePathComponent(imageId) : undefined;

  if (type === "avatar") {
    return `avatars/${safeUserId}.webp`;
  }

  if (type === "image") {
    if (!safeImageId) {
      throw new Error("画像IDが必要です");
    }

    const baseKey = `images/${safeUserId}/${safeImageId}`;

    return variant === "thumbnail" ? `${baseKey}_thumbnail.webp` : `${baseKey}.webp`;
  }

  throw new Error("アップロードタイプが無効です");
}

/**
 * 投稿画像のURLを取得
 * @param userId ユーザーID
 * @param imageId 画像ID
 * @param variant 画像バリアント（デフォルト: thumbnail）
 * @returns 画像URL
 */

export function getImageUrl(userId: string, imageId: string, variant: "original" | "thumbnail" = "thumbnail"): string {
  const bucketPublicUrl = process.env.NEXT_PUBLIC_IMAGE_R2_URL;

  if (!bucketPublicUrl) {
    throw new Error("NEXT_PUBLIC_IMAGE_R2_URLが設定されていません");
  }

  return `${bucketPublicUrl}/${generateR2Key("image", userId, imageId, variant)}`;
}

/**
 * ユーザーアバター画像のURLを取得
 * @param userId ユーザーID
 * @param avatarSetAt アバター画像の更新日時
 * @returns アバター画像URL
 */
export function getUserAvatarUrl(userId: string, avatarSetAt?: Date | null): string {
  const bucketPublicUrl = process.env.NEXT_PUBLIC_IMAGE_R2_URL;

  if (!bucketPublicUrl) {
    throw new Error("NEXT_PUBLIC_IMAGE_R2_URLが設定されていません");
  }

  const baseUrl = `${bucketPublicUrl}/${generateR2Key("avatar", userId)}`;

  // avatarSetAtがあるならタイムスタンプを追加
  // アイコン変更時に即時反映されるようにする目的
  if (avatarSetAt) {
    return `${baseUrl}?v=${avatarSetAt.getTime()}`;
  }

  return baseUrl;
}

/**
 * 画像をR2にアップロード
 * @param r2 Cloudflare R2バケットインスタンス
 * @param key R2のキー
 * @param options アップロードオプション
 */
async function upload(r2: R2Bucket, key: string, options: UploadToR2Options): Promise<void> {
  try {
    await r2.put(key, options.imageBuffer, {
      httpMetadata: {
        contentType: "image/webp",
      },
    });
  } catch (error) {
    throw new Error(`R2へのアップロードに失敗しました: ${error}`);
  }
}

/**
 * 変換済みアバター画像をR2にアップロード
 * @param r2 Cloudflare R2バケットインスタンス
 * @param options アップロードオプション
 */
export async function uploadAvatarImage(r2: R2Bucket, options: UploadAvatarImageOptions): Promise<void> {
  try {
    const key = generateR2Key("avatar", options.userId);

    await upload(r2, key, {
      imageBuffer: options.imageBuffer,
      userId: options.userId,
    });
  } catch (error) {
    throw new Error(`アバター画像のアップロードに失敗しました: ${error}`);
  }
}

/**
 * 変換済み画像をR2にアップロード（オリジナルとサムネイルの両方）
 * @param r2 Cloudflare R2バケットインスタンス
 * @param options アップロードオプション
 */
export async function uploadImage(r2: R2Bucket, options: UploadImageOptions): Promise<void> {
  try {
    const originalKey = generateR2Key("image", options.userId, options.imageId, "original");
    const thumbnailKey = generateR2Key("image", options.userId, options.imageId, "thumbnail");

    await Promise.all([
      upload(r2, originalKey, {
        imageBuffer: options.variants.original.data,
        userId: options.userId,
        imageId: options.imageId,
      }),
      upload(r2, thumbnailKey, {
        imageBuffer: options.variants.thumbnail.data,
        userId: options.userId,
        imageId: options.imageId,
      }),
    ]);
  } catch (error) {
    throw new Error(`画像のアップロードに失敗しました: ${error}`);
  }
}

/**
 * R2から画像を削除
 * @param r2 R2バケットインスタンス
 * @param userId ユーザーID
 * @param imageId 画像ID
 */
export async function deleteImageFromR2(r2: R2Bucket, userId: string, imageId: string): Promise<void> {
  const originalKey = generateR2Key("image", userId, imageId, "original");
  const thumbnailKey = generateR2Key("image", userId, imageId, "thumbnail");

  await Promise.all([r2.delete(originalKey), r2.delete(thumbnailKey)]);
}

/**
 * R2からユーザーの全データを削除
 * @param r2 R2バケットインスタンス
 * @param userId ユーザーID
 */
export async function deleteUserDataFromR2(r2: R2Bucket, userId: string): Promise<void> {
  const safeUserId = sanitizePathComponent(userId);

  const avatarKey = `avatars/${safeUserId}`;
  const imagesPrefix = `images/${safeUserId}/`;

  const [, imagesList] = await Promise.all([r2.delete(avatarKey), r2.list({ prefix: imagesPrefix })]);

  if (imagesList.objects.length > 0) {
    return r2.delete(imagesList.objects.map(({ key }) => key));
  }
}
