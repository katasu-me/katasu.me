import { WorkerEntrypoint } from "cloudflare:workers";
import { generateAvatarImage, generateImageVariants, getImageDimensions } from "./lib/image";
import type { ImageVariants } from "./types";

export type { ImageDimensions, ImageVariants } from "./types";

export default class ImageOptimizerWorker extends WorkerEntrypoint {
  /**
   * fetch handlerは必須だが、Service Bindings経由では使用しない
   */
  async fetch() {
    return new Response(null, { status: 404 });
  }

  /**
   * アバター画像を生成
   * @param imageData 画像
   * @returns WebP形式のArrayBuffer
   */
  async generateAvatar(imageData: ArrayBuffer): Promise<ArrayBuffer> {
    try {
      // オリジナル画像の縦横を取得
      const originalImageDimensions = getImageDimensions(imageData);

      const avatarImage = await generateAvatarImage(imageData, {
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
   * @param imageData 画像データ
   * @returns 画像バリアント
   */
  async generateImageVariants(imageData: ArrayBuffer): Promise<ImageVariants> {
    try {
      // オリジナル画像の縦横を取得
      const originalImageDimensions = getImageDimensions(imageData);

      const variants = await generateImageVariants(imageData, {
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
