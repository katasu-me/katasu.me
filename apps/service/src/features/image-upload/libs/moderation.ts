import OpenAI from "openai";

/**
 * OpenAI Moderation APIで画像のモデレーションチェックを行う
 * @param apiKey OpenAI API Key
 * @param imageBuffer 画像データ
 * @returns 不適切な画像の場合true
 */
export async function checkImageModeration(apiKey: string, imageBuffer: ArrayBuffer): Promise<boolean> {
  const openai = new OpenAI({ apiKey });

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

    return response.results.at(0)?.flagged ?? true;
  } catch (error) {
    console.error("[moderation] モデレーションチェックに失敗しました:", error);
    throw error;
  }
}
