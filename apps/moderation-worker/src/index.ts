import { updateImageStatus } from "@katasu.me/service-db";
import { generateImageVariants } from "./libs/image";
import { checkImageModeration } from "./libs/moderation";
import { deleteImages, getImageUrl, uploadImages } from "./libs/r2";
import type { ModerationEnv, ModerationJobMessage } from "./libs/types";

export default {
  async queue(batch: MessageBatch<ModerationJobMessage>, env: ModerationEnv): Promise<void> {
    for (const message of batch.messages) {
      const { imageId, userId, tempId } = message.body;

      console.log(`[moderation] Processing image: ${imageId}, tempId: ${tempId}`);

      try {
        // 1. 一時バケットから画像を取得
        const tempObject = await env.TEMP_R2_BUCKET.get(tempId);

        if (!tempObject) {
          console.error(`[moderation] Temp file not found: ${tempId}`);
          message.ack(); // 一時ファイルがない場合はスキップ
          continue;
        }

        const imageData = await tempObject.arrayBuffer();

        // 2. WebP変換（original + thumbnail）
        console.log(`[moderation] Converting image to WebP: ${imageId}`);
        const variants = await generateImageVariants(imageData);

        // 3. 公開バケットに保存
        const { originalKey, thumbnailKey } = await uploadImages(env.IMAGES_R2_BUCKET, userId, imageId, variants);

        console.log(`[moderation] Uploaded images to R2: ${originalKey}, ${thumbnailKey}`);

        // 4. 一時ファイルを削除
        await env.TEMP_R2_BUCKET.delete(tempId);
        console.log(`[moderation] Deleted temp file: ${tempId}`);

        // 5. OpenAI Moderation APIでチェック
        const imageUrl = getImageUrl(env.VITE_IMAGE_R2_URL, userId, imageId);
        const flagged = await checkImageModeration(env.OPENAI_API_KEY, imageUrl);

        console.log(`[moderation] Moderation result for image ${imageId}: ${flagged ? "flagged" : "approved"}`);

        if (flagged) {
          // 違反 → 画像削除 → status: "moderation_violation"
          await deleteImages(env.IMAGES_R2_BUCKET, originalKey, thumbnailKey);
          await updateImageStatus(env.DB, imageId, "moderation_violation");

          console.log(`[moderation] Image flagged and deleted: ${imageId}`);
        } else {
          // OK → status: "published"
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
