import { env } from "cloudflare:workers";
import { checkImageStatus, updateImageStatus } from "@katasu.me/service-db";
import {
  deleteModerationMarker,
  deleteTempImage,
  getModerationMarker,
  getTempImage,
  putModerationMarker,
  uploadImages,
} from "@/libs/r2";
import type { UploadJobMessage } from "@/types/upload";
import { generateImageVariants } from "../libs/image";
import { moderateImage } from "../libs/moderation";

const MAX_RETRY_ATTEMPTS = 3;

/** OpenAI Moderation APIに渡すcontentType（取得できない場合のフォールバック） */
const DEFAULT_MODERATION_CONTENT_TYPE = "image/jpeg";

/**
 * 先行アップロード直後のモデレーション判定を行い、結果をマーカーに保存する
 *
 * 違反コンテンツを本番バケットに乗せないよう、投稿前にtemp段階で判定する。
 * 失敗時はマーカーを書かず、publish側のインラインモデレーションを安全網とする
 */
async function handleModerate(message: Message<UploadJobMessage>): Promise<void> {
  // 判別union上は確実だが、フィールドアクセスのため型を絞る
  if (message.body.type !== "moderate") {
    return;
  }

  const { tempImageId, userId } = message.body;

  try {
    const tempObject = await getTempImage(env.TEMP_R2_BUCKET, tempImageId);

    // 既に投稿で消費済み（temp削除済み）なら判定不要
    if (!tempObject) {
      message.ack();
      return;
    }

    const imageData = await tempObject.arrayBuffer();
    const contentType = tempObject.httpMetadata?.contentType ?? DEFAULT_MODERATION_CONTENT_TYPE;

    const flagged = await moderateImage(imageData, contentType);

    await putModerationMarker(env.TEMP_R2_BUCKET, tempImageId, { flagged, userId });

    // 違反コンテンツは保持しないため、本体を即削除する（マーカーは投稿時の判定に残す）
    if (flagged) {
      await deleteTempImage(env.TEMP_R2_BUCKET, tempImageId);
    }

    message.ack();
  } catch (error) {
    // ここでupdateImageStatusを呼ぶと、投稿済みの本物レコードをerrorで上書きする事故になるため呼ばない
    console.error(`[moderate] Error moderating temp image ${tempImageId}:`, error);

    if (message.attempts >= MAX_RETRY_ATTEMPTS) {
      // マーカーは書かない（publish側インラインモデレーションが安全網になる）
      console.error(`[moderate] Max retries reached for temp image ${tempImageId}`);
      message.ack();
    } else {
      message.retry();
    }
  }
}

/**
 * 投稿確定後の本番公開処理を行う
 *
 * tempのモデレーション結果を尊重し、未判定ならインラインで判定してから本番バケットに乗せる
 */
async function handlePublish(message: Message<UploadJobMessage>): Promise<void> {
  // type欠落=在庫メッセージもpublish扱い。moderateは別ハンドラで処理済み
  if (message.body.type === "moderate") {
    return;
  }

  const { imageId, userId } = message.body;

  try {
    // temp段階の判定結果を優先し、未判定（マーカーなし）ならインラインで判定する
    const marker = await getModerationMarker(env.TEMP_R2_BUCKET, imageId);

    // 違反判定済みならtempに触れる前に終了する（moderate側がtemp本体を削除済みの場合があるため、temp取得より先に見る）
    if (marker?.flagged) {
      await updateImageStatus(env.DB, imageId, "moderation_violation");
      await Promise.all([
        deleteTempImage(env.TEMP_R2_BUCKET, imageId),
        deleteModerationMarker(env.TEMP_R2_BUCKET, imageId),
      ]);
      message.ack();
      return;
    }

    const tempObject = await getTempImage(env.TEMP_R2_BUCKET, imageId);

    if (!tempObject) {
      // at-least-once配信で重複メッセージが届いた場合、published済みをerrorで上書きしないようstatusを確認する
      const statusResult = await checkImageStatus(env.DB, imageId, userId);

      if (statusResult.success && statusResult.data.status === "processing") {
        console.error(`[publish] Temp file not found: ${imageId}`);
        try {
          await updateImageStatus(env.DB, imageId, "error");
        } catch (e) {
          console.error(`[publish] Failed to update status to error: ${imageId}`, e);
        }
      } else if (!statusResult.success) {
        // DB障害時はretryに委ねる（ack()せずリトライさせる）
        console.error(`[publish] Failed to check image status: ${imageId}`);
        message.retry();
        return;
      }

      message.ack();
      return;
    }

    const imageData = await tempObject.arrayBuffer();
    const contentType = tempObject.httpMetadata?.contentType ?? DEFAULT_MODERATION_CONTENT_TYPE;

    const flagged = marker ? marker.flagged : await moderateImage(imageData, contentType);

    if (flagged) {
      await updateImageStatus(env.DB, imageId, "moderation_violation");
      await Promise.all([
        deleteTempImage(env.TEMP_R2_BUCKET, imageId),
        deleteModerationMarker(env.TEMP_R2_BUCKET, imageId),
      ]);
      message.ack();
      return;
    }

    const variants = await generateImageVariants(imageData);

    // 部分失敗時のリトライが冪等になるよう、本番put→status更新→temp/マーカー削除の順で行う
    await uploadImages(env.IMAGES_R2_BUCKET, userId, imageId, variants);
    await updateImageStatus(env.DB, imageId, "published");
    await Promise.all([
      deleteTempImage(env.TEMP_R2_BUCKET, imageId),
      deleteModerationMarker(env.TEMP_R2_BUCKET, imageId),
    ]);

    message.ack();
  } catch (error) {
    console.error(`[publish] Error processing image ${imageId}:`, error);

    if (message.attempts >= MAX_RETRY_ATTEMPTS) {
      console.error(`[publish] Max retries reached for image ${imageId}`);
      try {
        await updateImageStatus(env.DB, imageId, "error");
      } catch (e) {
        console.error(`[publish] Failed to update status to error: ${imageId}`, e);
      }
      message.ack();
    } else {
      message.retry();
    }
  }
}

/**
 * アップロードジョブのキューバッチを処理する
 */
export async function handleUploadQueue(batch: MessageBatch<UploadJobMessage>): Promise<void> {
  for (const message of batch.messages) {
    if (message.body.type === "moderate") {
      await handleModerate(message);
    } else {
      await handlePublish(message);
    }
  }
}
