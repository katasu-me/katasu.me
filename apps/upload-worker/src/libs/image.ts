import { imageSize } from "image-size";
import { optimizeImageExt } from "wasm-image-optimization";
import type { ConvertWebpOptions, ImageVariants } from "./types";

/** WebP変換時のデフォルト画質 */
const DEFAULT_QUALITY = 80;

/** サムネイルの最大サイズ */
const THUMBNAIL_MAX_SIZE = 500;

/** 画像の最大サイズ (2K) */
const IMAGE_MAX_SIZE = 2048;

/**
 * 画像サイズを取得
 */
function getImageDimensions(imageData: ArrayBuffer): { width: number; height: number } {
  const dimensions = imageSize(new Uint8Array(imageData));

  if (!dimensions.width || !dimensions.height) {
    throw new Error("画像サイズの取得に失敗しました");
  }

  // orientationの値が 5, 6, 7, 8 (90度または270度回転) の場合は入れ替える
  const needsSwap = dimensions.orientation && [5, 6, 7, 8].includes(dimensions.orientation);
  const width = needsSwap ? dimensions.height : dimensions.width;
  const height = needsSwap ? dimensions.width : dimensions.height;

  return { width, height };
}

/**
 * WebP形式へ変換
 */
async function convertToWebp(imageData: ArrayBuffer, options: ConvertWebpOptions): Promise<ArrayBuffer> {
  const width = options.maxWidth ? Math.min(options.originalWidth, options.maxWidth) : options.originalWidth;
  const height = options.maxHeight ? Math.min(options.originalHeight, options.maxHeight) : options.originalHeight;

  const result = await optimizeImageExt({
    format: "webp",
    image: imageData,
    width,
    height,
    quality: options.quality ?? DEFAULT_QUALITY,
  });

  if (!result) {
    throw new Error("画像の最適化に失敗しました");
  }

  return result.data.buffer as ArrayBuffer;
}

/**
 * 画像のバリアント（オリジナル + サムネイル）を生成
 */
export async function generateImageVariants(imageData: ArrayBuffer): Promise<ImageVariants> {
  const { width, height } = getImageDimensions(imageData);

  const [original, thumbnail] = await Promise.all([
    convertToWebp(imageData, {
      originalWidth: width,
      originalHeight: height,
      maxWidth: IMAGE_MAX_SIZE,
      maxHeight: IMAGE_MAX_SIZE,
    }),
    convertToWebp(imageData, {
      originalWidth: width,
      originalHeight: height,
      maxWidth: THUMBNAIL_MAX_SIZE,
      maxHeight: THUMBNAIL_MAX_SIZE,
      quality: 50,
    }),
  ]);

  return { original, thumbnail };
}
