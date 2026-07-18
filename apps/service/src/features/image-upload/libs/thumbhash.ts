import { rgbaToThumbHash } from "thumbhash";

/** ThumbHash計算用の最大サイズ（100pxに縮小して計算） */
const THUMBHASH_MAX_SIZE = 100;

/**
 * デコード済みのImageBitmapからThumbHashを計算
 *
 * リサイズ処理（process-image.ts）とデコード結果を共有するため、FileではなくImageBitmapを受け取る。
 * 渡されたbitmapはclose()しない（呼び出し側で管理する）
 *
 * @param imageBitmap デコード済みの画像
 * @returns Base64エンコードされたThumbHash文字列
 */
export function calculateThumbHashFromBitmap(imageBitmap: ImageBitmap): string {
  // アスペクト比を維持しながら最大サイズに収める
  const scale = Math.min(1, THUMBHASH_MAX_SIZE / Math.max(imageBitmap.width, imageBitmap.height));
  const width = Math.round(imageBitmap.width * scale);
  const height = Math.round(imageBitmap.height * scale);

  // OffscreenCanvasで描画
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas 2D context is not available");
  }

  ctx.drawImage(imageBitmap, 0, 0, width, height);

  // RGBAデータを取得
  const imageData = ctx.getImageData(0, 0, width, height);
  const rgba = new Uint8Array(imageData.data.buffer);

  // ThumbHashを計算
  const hash = rgbaToThumbHash(width, height, rgba);

  // Base64エンコード
  return btoa(String.fromCharCode(...hash));
}
