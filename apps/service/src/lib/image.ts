import { type OptimizeParams, type OptimizeResult, optimizeImageExt } from "wasm-image-optimization/next";

/** AVIF変換時のデフォルト画質 */
const DEFAULT_QUALITY = 80;

/** サムネイルの最大サイズ */
const THUMBNAIL_MAX_SIZE = 500;

/** アバター画像のサイズ */
const AVATAR_SIZE = 400;

type ConvertAvifOptions = Pick<OptimizeParams, "width" | "height" | "quality">;

/**
 * AVIF形式へ変換
 * @param imageData 画像
 * @param options オプション
 * @returns 変換結果
 */
export async function convertToAvif(imageData: BufferSource, options?: ConvertAvifOptions): Promise<OptimizeResult> {
  try {
    console.log("Starting image optimization to AVIF...", options);

    const optimizeResult = await optimizeImageExt({
      format: "avif",
      image: imageData,
      width: options?.width,
      height: options?.height,
      quality: options?.quality ?? DEFAULT_QUALITY,
    });

    if (!optimizeResult) {
      throw new Error("画像の最適化に失敗しました");
    }

    return optimizeResult;
  } catch (error) {
    throw new Error(`画像のリサイズに失敗しました: ${error}`);
  }
}

export type ImageVariantResult = {
  /** オリジナル画像 */
  original: OptimizeResult;

  /** サムネイル画像 */
  thumbnail: OptimizeResult;
};

/**
 * 画像のバリアントを生成
 * @param imageData 画像
 * @returns 生成された画像バリアント
 */
export async function generateImageVariants(imageData: BufferSource): Promise<ImageVariantResult> {
  try {
    const [original, thumbnail] = await Promise.all([
      // オリジナル
      convertToAvif(imageData),
      // サムネイル
      convertToAvif(imageData, {
        width: THUMBNAIL_MAX_SIZE,
        height: THUMBNAIL_MAX_SIZE,
      }),
    ]);

    return { original, thumbnail };
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
    const result = await convertToAvif(imageData, {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
    });

    return result.data.buffer as ArrayBuffer;
  } catch (error) {
    throw new Error(`アバター画像の生成に失敗しました: ${error}`);
  }
}
