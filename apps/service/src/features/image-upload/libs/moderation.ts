import { env } from "cloudflare:workers";

/** OpenAI Moderation APIのエンドポイント */
const OPENAI_MODERATION_ENDPOINT = "https://api.openai.com/v1/moderations";

/** SKIP_MODERATIONは開発用のローカルシークレットのため、生成される型には含まれない */
type ModerationEnv = {
  SKIP_MODERATION?: string;
};

type ModerationResponse = {
  results: Array<{ flagged: boolean }>;
};

/**
 * OpenAI Moderation APIで画像のモデレーションチェックを行う
 *
 * 公開URLではなくbase64データURLを渡すことで、本番バケットに乗せる前に判定できる。
 * バンドルサイズ温存のためopenai SDKは使わずfetchで直接叩く
 *
 * @returns flagged: true の場合は違反
 */
export async function checkImageModeration(
  apiKey: string,
  imageData: ArrayBuffer,
  contentType: string,
): Promise<boolean> {
  // 大きな配列に対するbtoa+スプレッドはスタックオーバーフローの危険があるためBufferを使う（nodejs_compat_v2前提）
  const base64 = Buffer.from(imageData).toString("base64");
  const dataUrl = `data:${contentType};base64,${base64}`;

  const response = await fetch(OPENAI_MODERATION_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "omni-moderation-latest",
      input: [
        {
          type: "image_url",
          image_url: {
            url: dataUrl,
          },
        },
      ],
    }),
  });

  // HTTPエラー時はthrowしてQueueリトライに乗せる
  if (!response.ok) {
    throw new Error(`OpenAI Moderation APIがエラーを返しました: ${response.status} ${response.statusText}`);
  }

  const result = (await response.json()) as ModerationResponse;

  return result.results.at(0)?.flagged ?? true;
}

/**
 * SKIP_MODERATION判定込みのモデレーション実行ラッパー
 *
 * @returns flagged: true の場合は違反（SKIP時は常にfalse）
 */
export async function moderateImage(imageData: ArrayBuffer, contentType: string): Promise<boolean> {
  if ((env as ModerationEnv).SKIP_MODERATION === "true") {
    return false;
  }

  return checkImageModeration(env.OPENAI_API_KEY, imageData, contentType);
}
