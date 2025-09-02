import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { convertToAvif, generateImageVariants } from "./image";

// テスト用の画像を動的に生成
async function createTestImage(width = 400, height = 300) {
  return await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 66, g: 165, b: 245, alpha: 1 },
    },
  })
    .png()
    .toBuffer();
}

describe("convertToAvif", () => {
  it("画像をAVIF形式に変換できる", async () => {
    const testImageBuffer = await createTestImage();
    const converted = await convertToAvif(testImageBuffer);
    const metadata = await sharp(converted).metadata();
    expect(metadata.format).toBe("heif");
  });

  it("リサイズオプションが適用される", async () => {
    const testImageBuffer = await createTestImage(800, 600);
    const converted = await convertToAvif(testImageBuffer, {
      width: 200,
      height: 150,
      fit: "cover",
    });
    const metadata = await sharp(converted).metadata();
    expect(metadata.width).toBe(200);
    expect(metadata.height).toBe(150);
  });

  it("品質パラメータが適用される", async () => {
    const testImageBuffer = await createTestImage();
    const highQuality = await convertToAvif(testImageBuffer, { quality: 90 });
    const lowQuality = await convertToAvif(testImageBuffer, { quality: 30 });
    expect(highQuality.length).toBeGreaterThan(lowQuality.length);
  });

  it("無効な画像データでエラーが発生する", async () => {
    const invalidData = Buffer.from("invalid image data");
    await expect(convertToAvif(invalidData)).rejects.toThrow();
  });
});

describe("generateImageVariants", () => {
  it("オリジナルとサムネイルを生成する", async () => {
    const testImageBuffer = await createTestImage();
    const result = await generateImageVariants(testImageBuffer);

    expect(result.original).toBeInstanceOf(Buffer);
    expect(result.thumbnail).toBeInstanceOf(Buffer);

    // オリジナル画像のメタデータを確認
    const originalMeta = await sharp(result.original).metadata();
    expect(originalMeta.format).toBe("heif");
    expect(originalMeta.width).toBe(400);
    expect(originalMeta.height).toBe(300);

    // サムネイル画像のメタデータを確認
    if (!result.thumbnail) {
      throw new Error("Thumbnail should be generated");
    }
    const thumbnailMeta = await sharp(result.thumbnail).metadata();
    expect(thumbnailMeta.format).toBe("heif");
    expect(thumbnailMeta.width).toBeLessThanOrEqual(1000);
    expect(thumbnailMeta.height).toBeLessThanOrEqual(1000);
  });

  it("大きな画像のサムネイルが1000x1000に収まる", async () => {
    // 2000x1500の大きな画像を作成
    const largeImage = await sharp({
      create: {
        width: 2000,
        height: 1500,
        channels: 4,
        background: { r: 255, g: 0, b: 0, alpha: 1 },
      },
    })
      .png()
      .toBuffer();

    const result = await generateImageVariants(largeImage);
    if (!result.thumbnail) {
      throw new Error("Thumbnail should be generated");
    }
    const thumbnailMeta = await sharp(result.thumbnail).metadata();

    expect(thumbnailMeta.width).toBe(1000);
    expect(thumbnailMeta.height).toBe(750); // アスペクト比を維持
  });

  it("縦長画像のサムネイルが1000x1000に収まる", async () => {
    // 1500x2000の縦長画像を作成
    const tallImage = await sharp({
      create: {
        width: 1500,
        height: 2000,
        channels: 4,
        background: { r: 0, g: 255, b: 0, alpha: 1 },
      },
    })
      .png()
      .toBuffer();

    const result = await generateImageVariants(tallImage);
    if (!result.thumbnail) {
      throw new Error("Thumbnail should be generated");
    }
    const thumbnailMeta = await sharp(result.thumbnail).metadata();

    expect(thumbnailMeta.width).toBe(750); // アスペクト比を維持
    expect(thumbnailMeta.height).toBe(1000);
  });

  it("無効な画像データでエラーが発生する", async () => {
    const invalidData = Buffer.from("invalid image data");
    await expect(generateImageVariants(invalidData)).rejects.toThrow("画像バリアントの生成に失敗しました");
  });
});
