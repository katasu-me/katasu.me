import { type OptimizeParams, optimizeImage } from "wasm-image-optimization/next";

/** AVIF変換時のデフォルト画質 */
const DEFAULT_QUALITY = 80;

/** サムネイルの最大サイズ */
const THUMBNAIL_MAX_SIZE = 1000;

/** アバター画像のサイズ */
const AVATAR_SIZE = 400;

type ConvertAvifOptions = Pick<OptimizeParams, "width" | "height" | "quality">;

/**
 * AVIF形式へ変換
 * @param imageData 画像
 * @param options オプション
 * @returns 変換後の画像
 */
async function convertToAvif(imageData: BufferSource, options?: ConvertAvifOptions): Promise<ArrayBuffer> {
  try {
    const image = await optimizeImage({
      format: "avif",
      image: imageData,
      width: options?.width,
      height: options?.height,
      quality: options?.quality ?? DEFAULT_QUALITY,
    });

    if (!image) {
      throw new Error("画像の最適化に失敗しました");
    }

    return image.buffer;
  } catch (error) {
    throw new Error(`画像のリサイズに失敗しました: ${error}`);
  }
}

export type ImageVariantResult = {
  /** オリジナル画像 */
  original: ArrayBuffer;

  /** サムネイル画像 */
  thumbnail: ArrayBuffer;
};

/**
 * 画像のバリアントを生成
 * @param imageData 画像
 * @returns 生成された画像バリアント
 */
export async function generateImageVariants(imageData: BufferSource): Promise<ImageVariantResult> {
  try {
    const [originalArrayBuffer, thumbnailArrayBuffer] = await Promise.all([
      // オリジナル
      convertToAvif(imageData),
      // サムネイル
      convertToAvif(imageData, {
        width: THUMBNAIL_MAX_SIZE,
        height: THUMBNAIL_MAX_SIZE,
      }),
    ]);

    return {
      original: originalArrayBuffer,
      thumbnail: thumbnailArrayBuffer,
    };
  } catch (error) {
    throw new Error(`画像バリアントの生成に失敗しました: ${error}`);
  }
}

/**
 * アバター画像を生成
 * @param imageData 画像
 * @returns アバター画像
 */
export async function generateAvatarImage(imageData: BufferSource): Promise<ArrayBuffer> {
  try {
    return convertToAvif(imageData, {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
    });
  } catch (error) {
    throw new Error(`アバター画像の生成に失敗しました: ${error}`);
  }
}
