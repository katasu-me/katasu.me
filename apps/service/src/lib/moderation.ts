import OpenAI from "openai";

/**
 * ArrayBufferをbase64エンコードする
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const uint8Array = new Uint8Array(buffer);
  let binary = "";

  for (let i = 0; i < uint8Array.byteLength; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }

  return btoa(binary);
}

/**
 * 画像がモデレーションに違反しているかチェックする
 * @param apiKey OpenAI APIキー
 * @param imageBuffer 画像データ（WebP形式）
 * @returns 違反している場合true
 */
export async function checkImageModeration(apiKey: string, imageBuffer: ArrayBuffer): Promise<boolean> {
  const openai = new OpenAI({
    apiKey,
  });

  // ArrayBufferをbase64エンコード
  const base64Image = arrayBufferToBase64(imageBuffer);
  const dataUrl = `data:image/webp;base64,${base64Image}`;

  try {
    // モデレーションAPIを呼び出し
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

    const result = response.results[0];

    if (!result) {
      console.error("[moderation] モデレーション結果が取得できませんでした");
      return false;
    }

    // フラグが立っている場合は不適切
    if (result.flagged) {
      console.warn("[moderation] 不適切な画像が検出されました:", result.categories);
      return true;
    }

    return false;
  } catch (error) {
    console.error("[moderation] モデレーションAPIの呼び出しに失敗しました:", error);
    // エラーが発生した場合は拒否 (安全側に倒す)
    return true;
  }
}
