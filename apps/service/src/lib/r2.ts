import { generateAvatarImage, generateImageVariants } from "./image";

type UploadAvatarImageOptions = {
  type: "avatar";
  imageBuffer: ArrayBuffer;
  userId: string;
};

type UploadImageOptions = {
  type: "image";
  imageBuffer: ArrayBuffer;
  userId: string;
  imageId: string;
};

type UploadOptions = UploadAvatarImageOptions | UploadImageOptions;

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
 * R2のキーを生成
 * @returns R2のキー
 */
function generateR2Key(
  type: "avatar" | "image",
  userId: string,
  imageId?: string,
  variant?: "original" | "thumbnail",
): string {
  if (type === "avatar") {
    return `avatars/${userId}.avif`;
  }

  if (type === "image") {
    const baseKey = `images/${userId}/${imageId}`;
    return variant === "thumbnail" ? `${baseKey}_thumbnail.avif` : `${baseKey}.avif`;
  }

  throw new Error("アップロードタイプが無効です");
}

/**
 * 画像をR2にアップロード
 * @param r2 Cloudflare R2バケットインスタンス
 * @param options アップロードオプション
 */
async function upload(r2: R2Bucket, key: string, options: UploadOptions): Promise<void> {
  try {
    await r2.put(key, options.imageBuffer, {
      httpMetadata: {
        contentType: "image/avif",
        cacheControl: "public, max-age=31536000", // 1年間キャッシュ
      },
    });
  } catch (error) {
    throw new Error(`R2へのアップロードに失敗しました: ${error}`);
  }
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

/**
 * アバター画像を生成してR2にアップロード
 * @param r2 Cloudflare R2バケットインスタンス
 * @param options アップロードオプション
 */
export async function uploadAvatarImage(r2: R2Bucket, options: UploadAvatarImageOptions): Promise<void> {
  try {
    const avatarBuffer = await generateAvatarImage(options.imageBuffer);
    const key = generateR2Key("avatar", options.userId);

    await upload(r2, key, {
      ...options,
      imageBuffer: avatarBuffer,
    });
  } catch (error) {
    throw new Error(`アバター画像のアップロードに失敗しました: ${error}`);
  }
}

/**
 * 画像をAVIFに変換してR2にアップロード（オリジナルとサムネイルの両方）
 * @param r2 Cloudflare R2バケットインスタンス
 * @param options アップロードオプション
 */
export async function uploadImage(r2: R2Bucket, options: UploadImageOptions): Promise<void> {
  try {
    const variants = await generateImageVariants(options.imageBuffer);

    const originalKey = generateR2Key("image", options.userId, options.imageId, "original");
    const thumbnailKey = generateR2Key("image", options.userId, options.imageId, "thumbnail");

    await Promise.all([
      upload(r2, originalKey, {
        ...options,
        imageBuffer: variants.original.data.buffer as ArrayBuffer,
      }),
      upload(r2, thumbnailKey, {
        ...options,
        imageBuffer: variants.thumbnail.data.buffer as ArrayBuffer,
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
