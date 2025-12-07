import { updateImageStatus } from "@katasu.me/service-db";
import { generateImageVariants } from "./libs/image";
import { checkImageModeration } from "./libs/moderation";
import { deleteImages, getImageUrl, uploadImages } from "./libs/r2";
import type { ModerationEnv, ModerationJobMessage } from "./libs/types";

export default {
  async queue(batch: MessageBatch<ModerationJobMessage>, env: ModerationEnv): Promise<void> {
    for (const message of batch.messages) {
      const { imageId, userId } = message.body;

      console.log(`[moderation] Processing image: ${imageId}, imageId: ${imageId}`);

      try {
        const tempObject = await env.TEMP_R2_BUCKET.get(imageId);

        if (!tempObject) {
          console.error(`[moderation] Temp file not found: ${imageId}`);
          message.ack(); // 一時ファイルがない場合はスキップ
          continue;
        }

        const imageData = await tempObject.arrayBuffer();

        // 画像を変換
        console.log(`[moderation] Converting image to WebP: ${imageId}`);
        const variants = await generateImageVariants(imageData);

        // 公開バケットに保存
        const { originalKey, thumbnailKey } = await uploadImages(env.IMAGES_R2_BUCKET, userId, imageId, variants);

        console.log(`[moderation] Uploaded images to R2: ${originalKey}, ${thumbnailKey}`);

        // 一時ファイルを削除
        await env.TEMP_R2_BUCKET.delete(imageId);
        console.log(`[moderation] Deleted temp file: ${imageId}`);

        // モデレーションチェック
        const imageUrl = getImageUrl(env.IMAGE_R2_URL, userId, imageId);
        const flagged = await checkImageModeration(env.OPENAI_API_KEY, imageUrl);

        console.log(`[moderation] Moderation result for image ${imageId}: ${flagged ? "flagged" : "approved"}`);

        if (flagged) {
          // 不適切な画像なら削除
          await deleteImages(env.IMAGES_R2_BUCKET, originalKey, thumbnailKey);
          await updateImageStatus(env.DB, imageId, "moderation_violation");

          console.log(`[moderation] Image flagged and deleted: ${imageId}`);
        } else {
          // 問題なければ公開状態に
          await updateImageStatus(env.DB, imageId, "published");

          console.log(`[moderation] Image published: ${imageId}`);
        }

        message.ack();
      } catch (error) {
        console.error(`[moderation] Error processing image ${imageId}:`, error);
        // エラー時はリトライのためにackしない
        message.retry();
      }
    }
  },
};
