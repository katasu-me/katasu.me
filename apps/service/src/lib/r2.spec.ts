import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getImageUrl } from "./r2";

describe("getImageUrl", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    process.env.NEXT_PUBLIC_R2_URL = "https://example.com";
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("サムネイル画像のURLを返す（デフォルト）", () => {
    const url = getImageUrl("testuser", "image123");
    expect(url).toBe("https://example.com/images/testuser/image123_thumbnail.webp");
  });

  it("サムネイル画像のURLを返す（明示的指定）", () => {
    const url = getImageUrl("testuser", "image123", "thumbnail");
    expect(url).toBe("https://example.com/images/testuser/image123_thumbnail.webp");
  });

  it("オリジナル画像のURLを返す", () => {
    const url = getImageUrl("testuser", "image123", "original");
    expect(url).toBe("https://example.com/images/testuser/image123.webp");
  });

  it("NEXT_PUBLIC_R2_URLが設定されていない場合、エラーをスローする", () => {
    delete process.env.NEXT_PUBLIC_R2_URL;
    expect(() => getImageUrl("testuser", "image123")).toThrow("R2_PUBLIC_URLが設定されていません");
  });
});
