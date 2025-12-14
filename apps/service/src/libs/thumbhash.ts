import { thumbHashToAverageRGBA, thumbHashToDataURL } from "thumbhash";
import { type HSL, rgbToHsl } from "./color";

/**
 * Base64エンコードされたThumbHashをバイト配列にデコード
 * @param thumbhashBase64 Base64エンコードされたThumbHash文字列
 * @returns デコードされたバイト配列、失敗した場合はnull
 */
function decodeBase64(thumbhashBase64: string): Uint8Array | null {
  try {
    return Uint8Array.from(atob(thumbhashBase64), (c) => c.charCodeAt(0));
  } catch {
    return null;
  }
}

/**
 * Base64エンコードされたThumbHashからDataURLを生成
 * @param thumbhashBase64 Base64エンコードされたThumbHash文字列
 * @returns ブラー画像のDataURL
 */
export function decodeThumbHash(thumbhashBase64: string): string {
  const bytes = decodeBase64(thumbhashBase64);
  if (!bytes) {
    return "";
  }

  return thumbHashToDataURL(bytes);
}

/**
 * ThumbHashから平均輝度を取得
 * @param thumbhashBase64 Base64エンコードされたThumbHash文字列
 * @returns 0〜1の範囲の輝度値、失敗した場合は0.5
 */
export function getThumbHashLuminance(thumbhashBase64: string): number {
  const bytes = decodeBase64(thumbhashBase64);
  if (!bytes || bytes.length === 0) {
    return 0.5;
  }

  // 最初のバイトの下位6ビットがl_dc
  const lDc = bytes[0] & 0b00111111;

  // 0-63の値を0-1に正規化
  return lDc / 63;
}

/**
 * ThumbHashから平均色のHSL値を取得
 * @param thumbhashBase64 Base64エンコードされたThumbHash文字列
 * @returns HSL値、失敗した場合はnull
 */
export function getThumbHashHSL(thumbhashBase64: string): HSL | null {
  const bytes = decodeBase64(thumbhashBase64);
  if (!bytes) {
    return null;
  }

  const { r, g, b } = thumbHashToAverageRGBA(bytes);
  return rgbToHsl(r, g, b);
}
