import OpenAI from "openai";

/**
 * OpenAI Moderation APIを使用して画像の適切性をチェック
 * @param apiKey OpenAI API Key
 * @param imageBuffer 画像データ
 * @returns 不適切な画像の場合true
 */
export async function checkImageModeration(apiKey: string, imageBuffer: ArrayBuffer): Promise<boolean> {
  const openai = new OpenAI({ apiKey });

  // ArrayBufferをBase64に変換
  const base64Image = Buffer.from(imageBuffer).toString("base64");
  const dataUrl = `data:image/webp;base64,${base64Image}`;

  try {
    const response = await openai.moderations.create({
      model: "omni-moderation-latest",
      input: [
        {
          type: "image_url",
          image_url: {
            url: dataUrl,
          },
        },
      ],
    });

    return response.results[0]?.flagged ?? false;
  } catch (error) {
    console.error("[moderation] モデレーションチェックに失敗しました:", error);
    // エラーの場合は安全側に倒して処理を続行
    return false;
  }
}
