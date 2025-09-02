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
 * 画像とサムネイルを生成してR2にアップロード
 * @param r2 Cloudflare R2バケットインスタンス
 * @param options アップロードオプション
 */
export async function uploadImage(r2: R2Bucket, options: UploadImageOptions): Promise<void> {
  try {
    const variants = await generateImageVariants(options.imageBuffer);

    const originalKey = generateR2Key("image", options.userId, options.imageId, "original");
    const thumbnailKey = generateR2Key("image", options.userId, options.imageId, "thumbnail");

    // オリジナル画像とサムネイルをアップロード
    await Promise.all([
      upload(r2, originalKey, {
        ...options,
        imageBuffer: variants.original,
      }),
      upload(r2, thumbnailKey, {
        ...options,
        imageBuffer: variants.thumbnail,
      }),
    ]);
  } catch (error) {
    throw new Error(`画像のアップロードに失敗しました: ${error}`);
  }
}
