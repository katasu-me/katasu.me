import { updateImageStatus } from "@katasu.me/service-db";
import OpenAI from "openai";

type ModerationJobMessage = {
  imageId: string;
  userId: string;
  imageUrl: string;
};

type ModerationEnv = Cloudflare.Env & {
  OPENAI_API_KEY: string;
};

/**
 * OpenAI Moderation APIで画像のモデレーションチェックを行う
 * @param apiKey OpenAI API Key
 * @param imageUrl 画像の公開URL
 * @returns 不適切な画像の場合true
 */
async function checkImageModeration(apiKey: string, imageUrl: string): Promise<boolean> {
  const openai = new OpenAI({ apiKey });

  const response = await openai.moderations.create({
    model: "omni-moderation-latest",
    input: [
      {
        type: "image_url",
        image_url: {
          url: imageUrl,
        },
      },
    ],
  });

  return response.results.at(0)?.flagged ?? true;
}

/**
 * オリジナル画像のキーからサムネイルのキーを生成
 */
function getThumbnailKey(originalKey: string): string {
  // NOTE: images/userId/imageId.webp -> images/userId/imageId_thumbnail.webp
  return originalKey.replace(".webp", "_thumbnail.webp");
}

export default {
  async queue(batch: MessageBatch<ModerationJobMessage>, env: ModerationEnv): Promise<void> {
    for (const message of batch.messages) {
      const { imageId, imageUrl } = message.body;

      console.log(`[moderation] Processing image: ${imageId}`);

      try {
        const flagged = await checkImageModeration(env.OPENAI_API_KEY, imageUrl);

        console.log(`[moderation] Moderation result for image ${imageId}: ${flagged ? "flagged" : "approved"}`);

        if (flagged) {
          // DBのステータスを更新
          const updateResult = await updateImageStatus(env.DB, imageId, "moderation_violation");

          if (!updateResult.success) {
            console.error(`[moderation] Failed to update image status: ${imageId}`, updateResult.error);
          }

          // R2から画像を削除
          const originalKey = new URL(imageUrl).pathname.slice(1);
          const thumbnailKey = getThumbnailKey(originalKey);
          await env.IMAGES_R2_BUCKET.delete([originalKey, thumbnailKey]);

          console.log(`[moderation] Deleted images from R2: ${originalKey}, ${thumbnailKey}`);
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
