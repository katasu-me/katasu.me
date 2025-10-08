import { imageSize } from "image-size";
import { type OptimizeParams, type OptimizeResult, optimizeImageExt } from "wasm-image-optimization";

/** WebP変換時のデフォルト画質 */
const DEFAULT_QUALITY = 80;

/** サムネイルの最大サイズ */
const THUMBNAIL_MAX_SIZE = 500;

/** 画像の最大サイズ (4K) */
const IMAGE_MAX_SIZE = 4096;

/** アバター画像のサイズ */
const AVATAR_SIZE = 400;

/** 許容される最大アスペクト比（縦:横 または 横:縦） */
const MAX_ASPECT_RATIO = 4;

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
 * WebP形式へ変換
 * @param imageData 画像
 * @param options オプション
 * @returns 変換結果
 */
async function convertToWebp(imageData: BufferSource, options?: ConvertWebpOptions): Promise<OptimizeResult> {
  try {
    // アスペクト比をチェック
    if (options?.originalWidth && options?.originalHeight) {
      const aspectRatio =
        Math.max(options.originalWidth, options.originalHeight) /
        Math.min(options.originalWidth, options.originalHeight);

      if (aspectRatio > MAX_ASPECT_RATIO) {
        throw new Error(`画像のアスペクト比が極端すぎます（最大${MAX_ASPECT_RATIO}:1まで）`);
      }
    }

    // 縦横のサイズを制限
    const width = options?.maxWidth ? Math.min(options.originalWidth, options.maxWidth) : options?.originalWidth;
    const height = options?.maxHeight ? Math.min(options.originalHeight, options.maxHeight) : options?.originalHeight;

    console.log("Original size:", options?.originalWidth, "x", options?.originalHeight);
    console.log(`Resizing image to ${width}x${height}`);

    const optimizeResult = await optimizeImageExt({
      format: "webp",
      image: imageData,
      width,
      height,
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

/**
 * Uint8ArrayをBase64エンコード
 */
function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = "";
  const len = bytes.byteLength;

  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return btoa(binary);
}

export type ImageDimensionsResult = {
  /** 画像の幅 (orientation考慮済み) */
  width: number;
  /** 画像の高さ (orientation考慮済み) */
  height: number;
};

/**
 * 画像サイズと向きを取得
 * @param imageData 画像データ
 * @returns 画像サイズ情報（orientation考慮済み）
 */
export function getImageDimensions(imageData: ArrayBuffer): ImageDimensionsResult {
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

export type ImageVariantResult = {
  /** オリジナル画像 */
  original: string;
  /** サムネイル画像 */
  thumbnail: string;
  /** 画像サイズ情報 */
  dimensions: ImageDimensionsResult;
};

/**
 * 圧縮した画像とサムネイル画像を生成
 * @param imageData 画像
 * @returns 生成されたバリアント
 */
export async function generateImageVariants(
  imageData: ArrayBuffer,
  { originalWidth, originalHeight }: GenerateImageOptions,
): Promise<ImageVariantResult> {
  try {
    const [original, thumbnail] = await Promise.all([
      // オリジナル
      convertToWebp(imageData, {
        originalWidth,
        originalHeight,
        maxWidth: IMAGE_MAX_SIZE,
        maxHeight: IMAGE_MAX_SIZE,
      }),
      // サムネイル
      convertToWebp(imageData, {
        originalWidth,
        originalHeight,
        maxWidth: THUMBNAIL_MAX_SIZE,
        maxHeight: THUMBNAIL_MAX_SIZE,
        quality: 50,
      }),
    ]);

    // 画像サイズ情報を取得
    const dimensions = getImageDimensions(imageData);

    return {
      original: uint8ArrayToBase64(original.data),
      thumbnail: uint8ArrayToBase64(thumbnail.data),
      dimensions,
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
export async function generateAvatarImage(imageData: ArrayBuffer, opts: GenerateImageOptions): Promise<Uint8Array> {
  try {
    const result = await convertToWebp(imageData, {
      ...opts,
      maxWidth: AVATAR_SIZE,
      maxHeight: AVATAR_SIZE,
      quality: 50,
    });

    return result.data;
  } catch (error) {
    throw new Error(`アバター画像の生成に失敗しました: ${error}`);
  }
}
