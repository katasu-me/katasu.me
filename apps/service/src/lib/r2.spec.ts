import { describe, expect, it, vi } from "vitest";
import { generateR2Path, uploadImage, uploadImageWithVariants } from "./r2";

vi.mock("./image", () => ({
  generateImageVariants: vi.fn(async () => ({
    original: Buffer.from("original-buffer"),
    thumbnail: Buffer.from("thumbnail-buffer"),
  })),
  generateAvatarImage: vi.fn(async () => Buffer.from("avatar-buffer")),
}));

describe("generateR2Path", () => {
  it("アバターのパスを正しく生成する", () => {
    const path = generateR2Path("avatar", "testuser", "dummy.jpg");
    expect(path).toBe("avatars/testuser.avif");
  });

  it("画像のオリジナルパスを正しく生成する", () => {
    const path = generateR2Path("image", "testuser", "image123");
    expect(path).toBe("images/testuser/image123.avif");
  });

  it("画像のサムネイルパスを正しく生成する", () => {
    const path = generateR2Path("image", "testuser", "image123", "thumbnail");
    expect(path).toBe("images/testuser/image123_thumbnail.avif");
  });

  it("無効なタイプでエラーをスローする", () => {
    expect(() => generateR2Path("invalid" as unknown as "image", "user", "file")).toThrow("Invalid upload type");
  });
});

describe("uploadToR2", () => {
  const mockR2Bucket = {
    put: vi.fn(),
  } as unknown as R2Bucket;

  it("画像をR2にアップロードする", async () => {
    const result = await uploadImage(mockR2Bucket, {
      type: "image",
      imageBuffer: Buffer.from("test"),
      username: "testuser",
      filename: "image123",
    });

    expect(mockR2Bucket.put).toHaveBeenCalledWith("images/testuser/image123.avif", Buffer.from("test"), {
      httpMetadata: {
        contentType: "image/avif",
        cacheControl: "public, max-age=31536000",
      },
    });
    expect(result).toBe("https://r2.katasu.me/images/testuser/image123.avif");
  });

  it("アバターをR2にアップロードする", async () => {
    const result = await uploadImage(mockR2Bucket, {
      type: "avatar",
      imageBuffer: Buffer.from("avatar"),
      username: "testuser",
      filename: "dummy",
    });

    expect(mockR2Bucket.put).toHaveBeenCalledWith("avatars/testuser.avif", Buffer.from("avatar"), {
      httpMetadata: {
        contentType: "image/avif",
        cacheControl: "public, max-age=31536000",
      },
    });
    expect(result).toBe("https://r2.katasu.me/avatars/testuser.avif");
  });
});

describe("uploadImageWithVariants", () => {
  const mockR2Bucket = {
    put: vi.fn(),
  } as unknown as R2Bucket;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("画像とサムネイルを両方アップロードする", async () => {
    const result = await uploadImageWithVariants(
      mockR2Bucket,
      Buffer.from("test-image"),
      "image",
      "testuser",
      "image123",
    );

    expect(mockR2Bucket.put).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      originalUrl: "https://r2.katasu.me/images/testuser/image123.avif",
      thumbnailUrl: "https://r2.katasu.me/images/testuser/image123_thumbnail.avif",
    });
  });

  it("アバターは単一画像のみアップロードする", async () => {
    const result = await uploadImageWithVariants(
      mockR2Bucket,
      Buffer.from("test-avatar"),
      "avatar",
      "testuser",
      "dummy",
    );

    expect(mockR2Bucket.put).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      originalUrl: "https://r2.katasu.me/avatars/testuser.avif",
      thumbnailUrl: undefined,
    });
  });
});
