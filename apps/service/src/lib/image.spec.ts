import { beforeEach, describe, expect, it, vi } from "vitest";
import { generateAvatarImage, generateImageVariants } from "./image";

// optimizeImageExtのモック
vi.mock("wasm-image-optimization/next", () => ({
  optimizeImageExt: vi.fn(),
}));

import { optimizeImageExt } from "wasm-image-optimization/next";

// テスト用の画像バッファを作成
function createTestImageBuffer(): ArrayBuffer {
  return new ArrayBuffer(100);
}

describe("generateImageVariants", () => {
  const mockOptimizeImageExt = vi.mocked(optimizeImageExt);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("オリジナルとサムネイルを生成する", async () => {
    const testImageBuffer = createTestImageBuffer();
    const mockOriginalBuffer = new ArrayBuffer(200);
    const mockThumbnailBuffer = new ArrayBuffer(100);

    mockOptimizeImageExt
      .mockResolvedValueOnce({ data: { buffer: mockOriginalBuffer } } as any)
      .mockResolvedValueOnce({ data: { buffer: mockThumbnailBuffer } } as any);

    const result = await generateImageVariants(testImageBuffer);

    expect(result.original.data.buffer).toBe(mockOriginalBuffer);
    expect(result.thumbnail.data.buffer).toBe(mockThumbnailBuffer);

    // optimizeImageExtが正しいパラメータで呼ばれているか確認
    expect(mockOptimizeImageExt).toHaveBeenCalledTimes(2);
    expect(mockOptimizeImageExt).toHaveBeenNthCalledWith(1, {
      format: "avif",
      image: testImageBuffer,
      width: 4096,
      height: 4096,
      quality: 80,
    });
    expect(mockOptimizeImageExt).toHaveBeenNthCalledWith(2, {
      format: "avif",
      image: testImageBuffer,
      width: 500,
      height: 500,
      quality: 80,
    });
  });

  it("optimizeImageExtがnullを返した場合エラーをスローする", async () => {
    const testImageBuffer = createTestImageBuffer();
    mockOptimizeImageExt.mockResolvedValueOnce(null as any);

    await expect(generateImageVariants(testImageBuffer)).rejects.toThrow(
      "画像バリアントの生成に失敗しました: Error: 画像のリサイズに失敗しました: Error: 画像の最適化に失敗しました",
    );
  });

  it("optimizeImageExtがエラーをスローした場合、適切にキャッチされる", async () => {
    const testImageBuffer = createTestImageBuffer();
    mockOptimizeImageExt.mockRejectedValueOnce(new Error("Optimization failed"));

    await expect(generateImageVariants(testImageBuffer)).rejects.toThrow(
      "画像バリアントの生成に失敗しました: Error: 画像のリサイズに失敗しました: Error: Optimization failed",
    );
  });

  it("並列処理の一部が失敗した場合でもエラーをスローする", async () => {
    const testImageBuffer = createTestImageBuffer();
    const mockOriginalBuffer = new ArrayBuffer(200);

    mockOptimizeImageExt
      .mockResolvedValueOnce({ data: { buffer: mockOriginalBuffer } } as any)
      .mockRejectedValueOnce(new Error("Thumbnail generation failed"));

    await expect(generateImageVariants(testImageBuffer)).rejects.toThrow(
      "画像バリアントの生成に失敗しました: Error: 画像のリサイズに失敗しました: Error: Thumbnail generation failed",
    );
  });
});

describe("generateAvatarImage", () => {
  const mockOptimizeImageExt = vi.mocked(optimizeImageExt);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("アバター画像を生成する", async () => {
    const testImageBuffer = createTestImageBuffer();
    const mockAvatarBuffer = new ArrayBuffer(150);

    mockOptimizeImageExt.mockResolvedValueOnce({ data: { buffer: mockAvatarBuffer } } as any);

    const result = await generateAvatarImage(testImageBuffer);

    expect(result).toBe(mockAvatarBuffer);

    // optimizeImageExtが正しいパラメータで呼ばれているか確認
    expect(mockOptimizeImageExt).toHaveBeenCalledTimes(1);
    expect(mockOptimizeImageExt).toHaveBeenCalledWith({
      format: "avif",
      image: testImageBuffer,
      width: 400,
      height: 400,
      quality: 80,
    });
  });

  it("optimizeImageExtがnullを返した場合エラーをスローする", async () => {
    const testImageBuffer = createTestImageBuffer();
    mockOptimizeImageExt.mockResolvedValueOnce(null as any);

    await expect(generateAvatarImage(testImageBuffer)).rejects.toThrow();
  });

  it("optimizeImageExtがエラーをスローした場合、適切にキャッチされる", async () => {
    const testImageBuffer = createTestImageBuffer();
    mockOptimizeImageExt.mockRejectedValueOnce(new Error("Avatar optimization failed"));

    await expect(generateAvatarImage(testImageBuffer)).rejects.toThrow();
  });
});
