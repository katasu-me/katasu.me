import OpenAI from "openai";

/**
 * OpenAI Moderation APIで画像のモデレーションチェックを行う
 * @returns flagged: true の場合は違反
 */
export async function checkImageModeration(apiKey: string, imageUrl: string): Promise<boolean> {
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
