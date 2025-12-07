import { rgbaToThumbHash } from "thumbhash";

/** ThumbHash計算用の最大サイズ（100pxに縮小して計算） */
const THUMBHASH_MAX_SIZE = 100;

/**
 * 画像ファイルからThumbHashを計算
 * @param file 画像ファイル
 * @returns Base64エンコードされたThumbHash文字列
 */
export async function calculateThumbHash(file: File): Promise<string> {
  const imageBitmap = await createImageBitmap(file);

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
  imageBitmap.close();

  // RGBAデータを取得
  const imageData = ctx.getImageData(0, 0, width, height);
  const rgba = new Uint8Array(imageData.data.buffer);

  // ThumbHashを計算
  const hash = rgbaToThumbHash(width, height, rgba);

  // Base64エンコード
  return btoa(String.fromCharCode(...hash));
}
