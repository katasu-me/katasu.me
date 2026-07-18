import type { ImageVariants } from "@/features/image-upload/libs/image";
import type { ModerationMarker } from "@/types/upload";

type UploadAvatarImageOptions = {
  type: "avatar";
  imageBuffer: ArrayBuffer;
  userId: string;
};

type UploadTempImageOptions = {
  imageId: string;
  file: File;
  /** 投稿確定時に所有権・寸法を検証するためのメタデータ */
  metadata: {
    userId: string;
    width: number;
    height: number;
  };
};

export type TempImageMetadata = {
  userId: string;
  width: number;
  height: number;
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
      customMetadata: {
        userId: options.metadata.userId,
        width: String(options.metadata.width),
        height: String(options.metadata.height),
      },
    });
  } catch (error) {
    throw new Error(`一時ファイルのアップロードに失敗しました: ${error}`);
  }
}

/**
 * 一時バケットの画像メタデータを取得し、所有権を検証する
 *
 * 他ユーザーのtempImageIdを指定した投稿・削除を防ぐため、customMetadataのuserIdを必ず照合する
 *
 * @param r2 一時バケットのR2インスタンス
 * @param tempImageId 一時画像ID
 * @param userId リクエストユーザーのID
 * @returns 検証済みメタデータ（存在しない・所有者不一致・メタデータ破損の場合はnull）
 */
export async function headTempImage(
  r2: R2Bucket,
  tempImageId: string,
  userId: string,
): Promise<TempImageMetadata | null> {
  const safeTempId = sanitizePathComponent(tempImageId);
  const object = await r2.head(safeTempId);

  if (!object?.customMetadata) {
    return null;
  }

  const { userId: ownerId, width, height } = object.customMetadata;

  if (ownerId !== userId) {
    return null;
  }

  // customMetadataは文字列のみのため数値として再検証する
  const parsedWidth = Number.parseInt(width ?? "", 10);
  const parsedHeight = Number.parseInt(height ?? "", 10);

  if (!Number.isFinite(parsedWidth) || !Number.isFinite(parsedHeight) || parsedWidth <= 0 || parsedHeight <= 0) {
    return null;
  }

  return { userId: ownerId, width: parsedWidth, height: parsedHeight };
}

/**
 * 一時バケットから画像を取得（サニタイズ済み）
 * @param r2 一時バケットのR2インスタンス
 * @param tempImageId 一時画像ID
 * @returns R2オブジェクト（存在しない場合はnull）
 */
export async function getTempImage(r2: R2Bucket, tempImageId: string): Promise<R2ObjectBody | null> {
  return r2.get(sanitizePathComponent(tempImageId));
}

/**
 * 一時バケットの画像を削除（サニタイズ済み）
 * @param r2 一時バケットのR2インスタンス
 * @param tempImageId 一時画像ID
 */
export async function deleteTempImage(r2: R2Bucket, tempImageId: string): Promise<void> {
  await r2.delete(sanitizePathComponent(tempImageId));
}

/**
 * モデレーション結果マーカーのキーを生成
 *
 * 先行モデレーション（queueコンシューマ）と投稿時の判定で同じキーを参照する
 * @param tempImageId 一時画像ID
 * @returns マーカーのR2キー
 */
export function generateTempModerationKey(tempImageId: string): string {
  return `moderation/${sanitizePathComponent(tempImageId)}`;
}

/**
 * 先行モデレーションの結果マーカーを読み取る
 * @param r2 一時バケットのR2インスタンス
 * @param tempImageId 一時画像ID
 * @returns マーカー（存在しない・JSONパース失敗時はnull）
 */
export async function getModerationMarker(r2: R2Bucket, tempImageId: string): Promise<ModerationMarker | null> {
  const object = await r2.get(generateTempModerationKey(tempImageId));

  if (!object) {
    return null;
  }

  try {
    return (await object.json()) as ModerationMarker;
  } catch {
    return null;
  }
}

/**
 * モデレーション結果マーカーを削除する（ベストエフォート）
 * @param r2 一時バケットのR2インスタンス
 * @param tempImageId 一時画像ID
 */
export async function deleteModerationMarker(r2: R2Bucket, tempImageId: string): Promise<void> {
  await r2.delete(generateTempModerationKey(tempImageId));
}

/**
 * モデレーション結果マーカーを書き込む
 * @param r2 一時バケットのR2インスタンス
 * @param tempImageId 一時画像ID
 * @param marker モデレーション結果マーカー
 */
export async function putModerationMarker(r2: R2Bucket, tempImageId: string, marker: ModerationMarker): Promise<void> {
  await r2.put(generateTempModerationKey(tempImageId), JSON.stringify(marker), {
    httpMetadata: { contentType: "application/json" },
  });
}

/**
 * 投稿画像のバリアントを本番バケットにアップロード
 * @param r2 本番バケットのR2インスタンス
 * @param userId ユーザーID
 * @param imageId 画像ID
 * @param variants アップロードするバリアント
 * @returns アップロードしたオブジェクトのキー
 */
export async function uploadImages(
  r2: R2Bucket,
  userId: string,
  imageId: string,
  variants: ImageVariants,
): Promise<{ originalKey: string; thumbnailKey: string }> {
  const originalKey = generateR2Key("image", userId, imageId, "original");
  const thumbnailKey = generateR2Key("image", userId, imageId, "thumbnail");

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
