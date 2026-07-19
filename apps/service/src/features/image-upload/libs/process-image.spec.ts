import { describe, expect, it } from "vitest";
import { calcResizedDimensions, pickFallbackEncodeType, renameExtension } from "./process-image";

describe("calcResizedDimensions", () => {
  it("最大辺長以下の画像はリサイズ不要と判定する", () => {
    expect(calcResizedDimensions(2048, 1024, 2048)).toEqual({
      width: 2048,
      height: 1024,
      needsResize: false,
    });
  });

  it("横長画像は幅を最大辺長に合わせて縮小する", () => {
    expect(calcResizedDimensions(4096, 2048, 2048)).toEqual({
      width: 2048,
      height: 1024,
      needsResize: true,
    });
  });

  it("縦長画像は高さを最大辺長に合わせて縮小する", () => {
    expect(calcResizedDimensions(1500, 3000, 2048)).toEqual({
      width: 1024,
      height: 2048,
      needsResize: true,
    });
  });

  it("縮小後の寸法は整数に丸められる", () => {
    const { width, height } = calcResizedDimensions(3001, 1999, 2048);

    expect(Number.isInteger(width)).toBe(true);
    expect(Number.isInteger(height)).toBe(true);
    // アスペクト比が概ね維持されていること
    expect(width / height).toBeCloseTo(3001 / 1999, 2);
  });

  it("正方形画像も正しく縮小する", () => {
    expect(calcResizedDimensions(4000, 4000, 2048)).toEqual({
      width: 2048,
      height: 2048,
      needsResize: true,
    });
  });
});

describe("pickFallbackEncodeType", () => {
  it("PNG原画は透過保持のためPNGを返す", () => {
    expect(pickFallbackEncodeType("image/png")).toBe("image/png");
  });

  it("JPEG原画はJPEGを返す", () => {
    expect(pickFallbackEncodeType("image/jpeg")).toBe("image/jpeg");
  });

  it("WebP原画はJPEGを返す", () => {
    expect(pickFallbackEncodeType("image/webp")).toBe("image/jpeg");
  });
});

describe("renameExtension", () => {
  it("拡張子をMIMEタイプに合わせて変更する", () => {
    expect(renameExtension("photo.jpg", "image/webp")).toBe("photo.webp");
  });

  it("拡張子がないファイル名にも拡張子を付与する", () => {
    expect(renameExtension("photo", "image/jpeg")).toBe("photo.jpeg");
  });

  it("ドットを複数含むファイル名は最後の拡張子のみ変更する", () => {
    expect(renameExtension("my.photo.png", "image/webp")).toBe("my.photo.webp");
  });
});
