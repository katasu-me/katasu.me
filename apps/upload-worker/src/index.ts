import { updateImageStatus } from "@katasu.me/service-db";
import { generateImageVariants } from "./libs/image";
import { checkImageModeration } from "./libs/moderation";
import { deleteImages, getImageUrl, uploadImages } from "./libs/r2";
import type { UploadEnv, UploadJobMessage } from "./libs/types";

const MAX_RETRY_ATTEMPTS = 3;

export default {
  async queue(batch: MessageBatch<UploadJobMessage>, env: UploadEnv): Promise<void> {
    for (const message of batch.messages) {
      const { imageId, userId } = message.body;

      try {
        const tempObject = await env.TEMP_R2_BUCKET.get(imageId);

        if (!tempObject) {
          console.error(`[upload] Temp file not found: ${imageId}`);
          await updateImageStatus(env.DB, imageId, "error");
          message.ack();
          continue;
        }

        const imageData = await tempObject.arrayBuffer();
        const variants = await generateImageVariants(imageData);

        const { originalKey, thumbnailKey } = await uploadImages(env.IMAGES_R2_BUCKET, userId, imageId, variants);

        // 一時ファイルを削除
        await env.TEMP_R2_BUCKET.delete(imageId);

        // モデレーションチェック
        const imageUrl = getImageUrl(env.IMAGE_R2_URL, userId, imageId);
        const flagged = await checkImageModeration(env.OPENAI_API_KEY, imageUrl);

        if (flagged) {
          // 不適切な画像なら削除
          await deleteImages(env.IMAGES_R2_BUCKET, originalKey, thumbnailKey);
          await updateImageStatus(env.DB, imageId, "moderation_violation");
        } else {
          // 問題なければ公開状態に
          await updateImageStatus(env.DB, imageId, "published");
        }

        message.ack();
      } catch (error) {
        console.error(`[upload] Error processing image ${imageId}:`, error);

        if (message.attempts >= MAX_RETRY_ATTEMPTS) {
          // リトライ上限に達したらエラーステータスに更新
          console.error(`[upload] Max retries reached for image ${imageId}`);
          await updateImageStatus(env.DB, imageId, "error");
          message.ack();
        } else {
          // リトライ
          message.retry();
        }
      }
    }
  },
};
