import { beforeEach, describe, expect, it, vi } from "vitest";
import { generateAvatarImage, generateImageVariants } from "./image";

// optimizeImageのモック
vi.mock("wasm-image-optimization/next", () => ({
  optimizeImage: vi.fn(),
}));

import { optimizeImage } from "wasm-image-optimization/next";

// テスト用の画像バッファを作成
function createTestImageBuffer(): ArrayBuffer {
  return new ArrayBuffer(100);
}

describe("generateImageVariants", () => {
  const mockOptimizeImage = vi.mocked(optimizeImage);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("オリジナルとサムネイルを生成する", async () => {
    const testImageBuffer = createTestImageBuffer();
    const mockOriginalBuffer = new ArrayBuffer(200);
    const mockThumbnailBuffer = new ArrayBuffer(100);

    mockOptimizeImage
      .mockResolvedValueOnce({ buffer: mockOriginalBuffer } as any)
      .mockResolvedValueOnce({ buffer: mockThumbnailBuffer } as any);

    const result = await generateImageVariants(testImageBuffer);

    expect(result.original).toBe(mockOriginalBuffer);
    expect(result.thumbnail).toBe(mockThumbnailBuffer);

    // optimizeImageが正しいパラメータで呼ばれているか確認
    expect(mockOptimizeImage).toHaveBeenCalledTimes(2);
    expect(mockOptimizeImage).toHaveBeenNthCalledWith(1, {
      format: "avif",
      image: testImageBuffer,
      width: undefined,
      height: undefined,
      quality: 80,
    });
    expect(mockOptimizeImage).toHaveBeenNthCalledWith(2, {
      format: "avif",
      image: testImageBuffer,
      width: 1000,
      height: 1000,
      quality: 80,
    });
  });

  it("optimizeImageがnullを返した場合エラーをスローする", async () => {
    const testImageBuffer = createTestImageBuffer();
    mockOptimizeImage.mockResolvedValueOnce(null as any);

    await expect(generateImageVariants(testImageBuffer)).rejects.toThrow(
      "画像バリアントの生成に失敗しました: Error: 画像のリサイズに失敗しました: Error: 画像の最適化に失敗しました",
    );
  });

  it("optimizeImageがエラーをスローした場合、適切にキャッチされる", async () => {
    const testImageBuffer = createTestImageBuffer();
    mockOptimizeImage.mockRejectedValueOnce(new Error("Optimization failed"));

    await expect(generateImageVariants(testImageBuffer)).rejects.toThrow(
      "画像バリアントの生成に失敗しました: Error: 画像のリサイズに失敗しました: Error: Optimization failed",
    );
  });

  it("並列処理の一部が失敗した場合でもエラーをスローする", async () => {
    const testImageBuffer = createTestImageBuffer();
    const mockOriginalBuffer = new ArrayBuffer(200);

    mockOptimizeImage
      .mockResolvedValueOnce({ buffer: mockOriginalBuffer } as any)
      .mockRejectedValueOnce(new Error("Thumbnail generation failed"));

    await expect(generateImageVariants(testImageBuffer)).rejects.toThrow(
      "画像バリアントの生成に失敗しました: Error: 画像のリサイズに失敗しました: Error: Thumbnail generation failed",
    );
  });
});

describe("generateAvatarImage", () => {
  const mockOptimizeImage = vi.mocked(optimizeImage);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("アバター画像を生成する", async () => {
    const testImageBuffer = createTestImageBuffer();
    const mockAvatarBuffer = new ArrayBuffer(150);

    mockOptimizeImage.mockResolvedValueOnce({ buffer: mockAvatarBuffer } as any);

    const result = await generateAvatarImage(testImageBuffer);

    expect(result).toBe(mockAvatarBuffer);

    // optimizeImageが正しいパラメータで呼ばれているか確認
    expect(mockOptimizeImage).toHaveBeenCalledTimes(1);
    expect(mockOptimizeImage).toHaveBeenCalledWith({
      format: "avif",
      image: testImageBuffer,
      width: 400,
      height: 400,
      quality: 80,
    });
  });

  it("optimizeImageがnullを返した場合エラーをスローする", async () => {
    const testImageBuffer = createTestImageBuffer();
    mockOptimizeImage.mockResolvedValueOnce(null as any);

    await expect(generateAvatarImage(testImageBuffer)).rejects.toThrow();
  });

  it("optimizeImageがエラーをスローした場合、適切にキャッチされる", async () => {
    const testImageBuffer = createTestImageBuffer();
    mockOptimizeImage.mockRejectedValueOnce(new Error("Avatar optimization failed"));

    await expect(generateAvatarImage(testImageBuffer)).rejects.toThrow();
  });
});
