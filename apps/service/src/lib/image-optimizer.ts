import { hc } from "hono/client";
import type { AppType } from "../../../image-optimizer/src";

/**
 * 画像最適化Workerのクライアント
 */
export function getImageOptimizerClient(apiUrl: string, secret: string) {
  return hc<AppType>(apiUrl, {
    headers: {
      Authorization: `Bearer ${secret}`,
    },
  });
}

/**
 * Base64文字列をArrayBufferに変換
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes.buffer;
}

/**
 * 画像をWebP形式に変換（オリジナル + サムネイル）
 */
export async function convertImageVariants(apiUrl: string, secret: string, imageFile: File) {
  const client = getImageOptimizerClient(apiUrl, secret);

  const response = await client.image.$post({
    form: {
      image: imageFile,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Conversion failed:", errorText);
    throw new Error(`画像変換に失敗しました: ${errorText}`);
  }

  const { original, thumbnail, dimensions } = await response.json();

  // base64をArrayBufferに変換
  return {
    original: {
      data: base64ToArrayBuffer(original),
    },
    thumbnail: {
      data: base64ToArrayBuffer(thumbnail),
    },
    dimensions,
  };
}

/**
 * アバター画像をWebP形式に変換
 */
export async function convertAvatarImage(apiUrl: string, secret: string, imageFile: File) {
  const client = getImageOptimizerClient(apiUrl, secret);

  const response = await client.avatar.$post({
    form: {
      image: imageFile,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`アバター画像変換に失敗しました: ${errorText}`);
  }

  return await response.arrayBuffer();
}
