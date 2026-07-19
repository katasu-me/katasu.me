import { IMAGE_MAX_SIZE } from "../constants/image";
import { calculateThumbHashFromBitmap } from "./thumbhash";

/** 再エンコードをスキップするファイルサイズの閾値（小さいファイルは転送削減の効果が薄く、画質劣化だけが残るため） */
export const REENCODE_FILE_SIZE_THRESHOLD = 1.5 * 1024 * 1024;

/** queueコンシューマ側で再エンコード（q80）されるため、世代劣化を抑える目的で高めの品質にしている */
const ENCODE_QUALITY = 0.9;

export type ProcessedImage = {
  /** リサイズ・再エンコード済みのファイル（処理不要な場合は元ファイル） */
  file: File;
  width: number;
  height: number;
  /** Base64エンコードされたThumbHash */
  thumbhash: string;
};

type ResizedDimensions = {
  width: number;
  height: number;
  needsResize: boolean;
};

/**
 * アスペクト比を維持したまま最大辺長に収めた寸法を計算
 * @param width 元の幅
 * @param height 元の高さ
 * @param maxSize 最大辺長
 * @returns リサイズ後の寸法とリサイズ要否
 */
export function calcResizedDimensions(width: number, height: number, maxSize: number): ResizedDimensions {
  const scale = Math.min(1, maxSize / Math.max(width, height));

  if (scale === 1) {
    return { width, height, needsResize: false };
  }

  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
    needsResize: true,
  };
}

/**
 * WebPエンコード非対応ブラウザ（Safariは仕様通りPNGへ縮退する）でのフォールバック形式を決定
 * @param originalType 元ファイルのMIMEタイプ
 * @returns フォールバックで使用するMIMEタイプ
 */
export function pickFallbackEncodeType(originalType: string): "image/png" | "image/jpeg" {
  // PNG原画は透過を保持する必要があるためPNGのまま、それ以外は容量優先でJPEG
  return originalType === "image/png" ? "image/png" : "image/jpeg";
}

/**
 * MIMEタイプに合わせてファイル名の拡張子を変更
 * @param fileName 元のファイル名
 * @param mimeType 変更後のMIMEタイプ
 * @returns 拡張子を変更したファイル名
 */
export function renameExtension(fileName: string, mimeType: string): string {
  const ext = mimeType.replace("image/", "");
  const baseName = fileName.replace(/\.[^.]+$/, "");
  return `${baseName}.${ext}`;
}

/**
 * アップロード前に画像を縮小・再エンコードし、ThumbHashも同じデコード結果から計算する
 *
 * 転送量を減らして体感速度を上げることが目的。最終的な変換はqueueコンシューマ側で行われるため、
 * ここでの処理結果はあくまで「転送用」であり、サーバーは寸法等を再検証する
 *
 * @param file 元の画像ファイル
 * @returns 処理済みの画像情報
 */
export async function processImageFile(file: File): Promise<ProcessedImage> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });

  try {
    const thumbhash = calculateThumbHashFromBitmap(bitmap);
    const { width, height, needsResize } = calcResizedDimensions(bitmap.width, bitmap.height, IMAGE_MAX_SIZE);

    // 小さい画像は再エンコードによる画質劣化を避けてそのまま送る
    if (!needsResize && file.size <= REENCODE_FILE_SIZE_THRESHOLD) {
      return { file, width, height, thumbhash };
    }

    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Canvas 2D context is not available");
    }

    ctx.drawImage(bitmap, 0, 0, width, height);

    let blob = await canvas.convertToBlob({ type: "image/webp", quality: ENCODE_QUALITY });

    if (blob.type !== "image/webp") {
      const fallbackType = pickFallbackEncodeType(file.type);

      // PNGフォールバック結果が透過保持目的と一致する場合は再エンコード不要
      if (blob.type !== fallbackType) {
        blob = await canvas.convertToBlob({ type: fallbackType, quality: ENCODE_QUALITY });
      }
    }

    // 再エンコードで逆に大きくなった場合は元ファイルを採用（元ファイルはスキーマでサイズ検証済みのため安全）
    if (blob.size >= file.size) {
      return { file, width: bitmap.width, height: bitmap.height, thumbhash };
    }

    const processedFile = new File([blob], renameExtension(file.name, blob.type), { type: blob.type });

    return { file: processedFile, width, height, thumbhash };
  } finally {
    bitmap.close();
  }
}
