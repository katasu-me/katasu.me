type UploadAvatarImageOptions = {
  type: "avatar";
  imageBuffer: ArrayBuffer;
  userId: string;
};

type UploadTempImageOptions = {
  imageId: string;
  file: File;
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
  const bucketPublicUrl = import.meta.env.VITE_IMAGE_R2_URL;

  if (!bucketPublicUrl) {
    throw new Error("VITE_IMAGE_R2_URLが設定されていません");
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
  const bucketPublicUrl = import.meta.env.VITE_IMAGE_R2_URL;

  if (!bucketPublicUrl) {
    throw new Error("VITE_IMAGE_R2_URLが設定されていません");
  }

  const baseUrl = `${bucketPublicUrl}/${generateR2Key("avatar", userId)}`;

  // アイコン変更時に即時反映されるようにする目的
  // NOTE: new Date()で再度Dateインスタンスを作っているのは TypeError: b2.getTime is not a function がでたため (調査してない)
  if (avatarSetAt) {
    return `${baseUrl}?v=${new Date(avatarSetAt).getTime()}`;
  }

  return baseUrl;
}

/**
 * 変換済みアバター画像をR2にアップロード
 * @param r2 Cloudflare R2バケットインスタンス
 * @param options アップロードオプション
 */
export async function uploadAvatarImage(r2: R2Bucket, options: UploadAvatarImageOptions): Promise<void> {
  try {
    const key = generateR2Key("avatar", options.userId);

    await r2.put(key, options.imageBuffer, {
      httpMetadata: {
        contentType: "image/webp",
      },
    });
  } catch (error) {
    throw new Error(`アバター画像のアップロードに失敗しました: ${error}`);
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

/**
 * 一時バケットに画像をアップロード
 * @param r2 一時バケットのR2インスタンス
 * @param options アップロードオプション
 */
export async function uploadTempImage(r2: R2Bucket, options: UploadTempImageOptions): Promise<void> {
  const safeTempId = sanitizePathComponent(options.imageId);

  try {
    await r2.put(safeTempId, options.file, {
      httpMetadata: {
        contentType: options.file.type,
      },
    });
  } catch (error) {
    throw new Error(`一時ファイルのアップロードに失敗しました: ${error}`);
  }
}
