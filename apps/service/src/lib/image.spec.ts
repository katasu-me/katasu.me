import { describe, expect, it } from "vitest";
import { getImageUrl, getUserAvatarUrl } from "./image";

describe("getImageUrl", () => {
  it("サムネイル画像のURLを返す（デフォルト）", () => {
    const url = getImageUrl("testuser", "image123");
    expect(url).toMatch(/\/api\/images\/testuser\/image123\/thumbnail$/);
  });

  it("サムネイル画像のURLを返す（明示的指定）", () => {
    const url = getImageUrl("testuser", "image123", "thumbnail");
    expect(url).toMatch(/\/api\/images\/testuser\/image123\/thumbnail$/);
  });

  it("オリジナル画像のURLを返す", () => {
    const url = getImageUrl("testuser", "image123", "original");
    expect(url).toMatch(/\/api\/images\/testuser\/image123\/original$/);
  });
});

describe("getUserAvatarUrl", () => {
  it("アバター画像のURLを返す", () => {
    const url = getUserAvatarUrl("testuser", true);
    expect(url).toMatch(/\/api\/images\/avatars\/testuser$/);
  });

  it("userIdがnullの場合、デフォルトアバターを返す", () => {
    const url = getUserAvatarUrl(null, true);
    expect(url).toBe("/images/default-avatar-icon.avif");
  });

  it("userIdがundefinedの場合、デフォルトアバターを返す", () => {
    const url = getUserAvatarUrl(undefined, true);
    expect(url).toBe("/images/default-avatar-icon.avif");
  });

  it("hasAvatarがfalseの場合、デフォルトアバターを返す", () => {
    const url = getUserAvatarUrl("testuser", false);
    expect(url).toBe("/images/default-avatar-icon.avif");
  });

  it("hasAvatarを省略した場合（デフォルトtrue）、アバター画像のURLを返す", () => {
    const url = getUserAvatarUrl("testuser");
    expect(url).toMatch(/\/api\/images\/avatars\/testuser$/);
  });
});
