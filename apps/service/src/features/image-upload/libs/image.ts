import { imageSize } from "image-size";
import { type OptimizeParams, optimizeImageExt } from "wasm-image-optimization";
import type { ImageDimensions } from "@/types/image";
import { IMAGE_MAX_SIZE } from "../constants/image";

/** WebP変換時のデフォルト画質 */
const DEFAULT_QUALITY = 80;

/** アバター画像のサイズ */
const AVATAR_SIZE = 400;

/** サムネイルの最大サイズ */
const THUMBNAIL_MAX_SIZE = 500;

/** 許容される最大アスペクト比（縦:横 または 横:縦） */
export const MAX_ASPECT_RATIO = 4;

/** 投稿画像のバリアント（オリジナル + サムネイル） */
export type ImageVariants = {
  original: ArrayBuffer;
  thumbnail: ArrayBuffer;
};

type GenerateImageOptions = {
  originalWidth: number;
  originalHeight: number;
};

type ConvertWebpOptions = {
  maxWidth?: number;
  maxHeight?: number;
} & GenerateImageOptions &
  Pick<OptimizeParams, "quality">;

/**
 * WebP形式へ変換する共通処理
 *
 * アスペクト比チェックやエラーラッピングは呼び出し側が責務を持つ
 */
async function convertToWebpInternal(imageData: ArrayBuffer, options: ConvertWebpOptions): Promise<Uint8Array> {
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

  return result.data;
}

/**
 * WebP形式へ変換（アバター画像用）
 *
 * アスペクト比チェックを含む
 */
async function convertToWebp(imageData: ArrayBuffer, options: ConvertWebpOptions): Promise<Uint8Array> {
  const aspectRatio =
    Math.max(options.originalWidth, options.originalHeight) / Math.min(options.originalWidth, options.originalHeight);

  if (aspectRatio > MAX_ASPECT_RATIO) {
    throw new Error(`画像のアスペクト比が極端すぎます（最大${MAX_ASPECT_RATIO}:1まで）`);
  }

  try {
    return await convertToWebpInternal(imageData, options);
  } catch (error) {
    throw new Error(`画像のリサイズに失敗しました: ${error}`);
  }
}

/**
 * 投稿画像をWebP形式へ変換
 */
async function convertImageToWebp(imageData: ArrayBuffer, options: ConvertWebpOptions): Promise<ArrayBuffer> {
  const data = await convertToWebpInternal(imageData, options);
  return data.buffer as ArrayBuffer;
}

/**
 * 画像サイズと向きを取得
 * @param imageData 画像データ
 * @returns 画像サイズ情報（orientation考慮済み）
 */
export function getImageDimensions(imageData: ArrayBuffer): ImageDimensions {
  const dimensions = imageSize(new Uint8Array(imageData));

  if (!dimensions.width || !dimensions.height) {
    throw new Error("画像サイズの取得に失敗しました");
  }

  // orientationの値が 5, 6, 7, 8 (90度または270度回転) の場合は入れ替える
  // @see https://exiftool.org/TagNames/EXIF.html#:~:text=0x0112,8%20=%20Rotate%20270%20CW
  const needsSwap = dimensions.orientation && [5, 6, 7, 8].includes(dimensions.orientation);
  const width = needsSwap ? dimensions.height : dimensions.width;
  const height = needsSwap ? dimensions.width : dimensions.height;

  return { width, height };
}

/**
 * アバター画像を生成
 * @param imageData 画像
 * @returns アバター画像
 */
export async function generateAvatarImage(imageData: ArrayBuffer, opts: GenerateImageOptions): Promise<Uint8Array> {
  try {
    return await convertToWebp(imageData, {
      ...opts,
      maxWidth: AVATAR_SIZE,
      maxHeight: AVATAR_SIZE,
      quality: 50,
    });
  } catch (error) {
    throw new Error(`アバター画像の生成に失敗しました: ${error}`);
  }
}

/**
 * 投稿画像のバリアント（オリジナル + サムネイル）を生成
 * @param imageData 画像データ
 * @returns オリジナルとサムネイルのバリアント
 */
export async function generateImageVariants(imageData: ArrayBuffer): Promise<ImageVariants> {
  const { width, height } = getImageDimensions(imageData);

  const [original, thumbnail] = await Promise.all([
    convertImageToWebp(imageData, {
      originalWidth: width,
      originalHeight: height,
      maxWidth: IMAGE_MAX_SIZE,
      maxHeight: IMAGE_MAX_SIZE,
    }),
    convertImageToWebp(imageData, {
      originalWidth: width,
      originalHeight: height,
      maxWidth: THUMBNAIL_MAX_SIZE,
      maxHeight: THUMBNAIL_MAX_SIZE,
      quality: 50,
    }),
  ]);

  return { original, thumbnail };
}
