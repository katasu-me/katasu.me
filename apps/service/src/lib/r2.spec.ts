import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getImageUrl, getUserAvatarUrl } from "./r2";

describe("getUserAvatarUrl", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    process.env.R2_PUBLIC_URL = "https://example.com";
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("アバターが設定されている場合、R2のURLを返す", () => {
    const url = getUserAvatarUrl("avatars/testuser.webp");
    expect(url).toBe("https://example.com/avatars/testuser.webp");
  });

  it("アバターが設定されていない場合、デフォルトのURLを返す", () => {
    const url = getUserAvatarUrl(null);
    expect(url).toBe("/images/default-avatar-icon.webp");
  });

  it("R2_PUBLIC_URLが設定されていない場合、エラーをスローする", () => {
    delete process.env.R2_PUBLIC_URL;
    expect(() => getUserAvatarUrl("avatars/testuser.webp")).toThrow("R2_PUBLIC_URLが設定されていません");
  });
});

describe("getImageUrl", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    process.env.R2_PUBLIC_URL = "https://example.com";
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

  it("R2_PUBLIC_URLが設定されていない場合、エラーをスローする", () => {
    delete process.env.R2_PUBLIC_URL;
    expect(() => getImageUrl("testuser", "image123")).toThrow("R2_PUBLIC_URLが設定されていません");
  });
});
