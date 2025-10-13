import { WorkerEntrypoint } from "cloudflare:workers";
import { generateAvatarImage, generateImageVariants, getImageDimensions } from "./lib/image";

/**
 * 画像の次元情報
 */
export type ImageDimensions = {
  width: number;
  height: number;
};

/**
 * 画像バリアント（オリジナル + サムネイル）
 */
export type ImageVariants = {
  original: {
    data: ArrayBuffer;
  };
  thumbnail: {
    data: ArrayBuffer;
  };
  dimensions: ImageDimensions;
};

/**
 * 画像最適化Worker
 * Service Bindings経由で呼び出される
 */
export default class ImageOptimizerWorker extends WorkerEntrypoint {
  /**
   * fetch handlerは必須だが、Service Bindings経由では使用しない
   */
  async fetch() {
    return new Response(null, { status: 404 });
  }

  /**
   * アバター画像を生成
   * @param imageFile - 画像ファイル
   * @returns WebP形式のArrayBuffer
   */
  async generateAvatar(imageFile: File): Promise<ArrayBuffer> {
    try {
      const arrayBuffer = await imageFile.arrayBuffer();

      // オリジナル画像の縦横を取得
      const originalImageDimensions = getImageDimensions(arrayBuffer);

      const avatarImage = await generateAvatarImage(arrayBuffer, {
        originalWidth: originalImageDimensions.width,
        originalHeight: originalImageDimensions.height,
      });

      return avatarImage.buffer as ArrayBuffer;
    } catch (error) {
      console.error("[generateAvatar] エラー:", error);
      throw new Error(`アバター画像の生成に失敗しました: ${error}`);
    }
  }

  /**
   * 投稿画像のバリアント（オリジナル + サムネイル）を生成
   * @param imageFile - 画像ファイル
   * @returns base64エンコードされた画像バリアント
   */
  async generateImageVariants(imageFile: File): Promise<ImageVariants> {
    try {
      const arrayBuffer = await imageFile.arrayBuffer();

      // オリジナル画像の縦横を取得
      const originalImageDimensions = getImageDimensions(arrayBuffer);

      const variants = await generateImageVariants(arrayBuffer, {
        originalWidth: originalImageDimensions.width,
        originalHeight: originalImageDimensions.height,
      });

      return variants;
    } catch (error) {
      console.error("[generateImageVariants] エラー:", error);
      throw new Error(`画像バリアントの生成に失敗しました: ${error}`);
    }
  }
}
