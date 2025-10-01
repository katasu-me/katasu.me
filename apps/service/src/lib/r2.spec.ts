import { beforeEach, describe, expect, it, vi } from "vitest";
import { uploadAvatarImage, uploadImage } from "./r2";

vi.mock("./image", () => ({
  generateImageVariants: vi.fn(async () => ({
    original: {
      data: {
        buffer: Buffer.from("original-buffer").buffer,
      },
    },
    thumbnail: {
      data: {
        buffer: Buffer.from("thumbnail-buffer").buffer,
      },
    },
  })),
  generateAvatarImage: vi.fn(async () => Buffer.from("avatar-buffer").buffer),
}));

describe("uploadImage", () => {
  const mockR2Bucket = {
    put: vi.fn(),
  } as unknown as R2Bucket;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("画像をR2にアップロードする", async () => {
    await uploadImage(mockR2Bucket, {
      type: "image",
      imageBuffer: Buffer.from("test"),
      userId: "testuser",
      imageId: "image123",
    });

    expect(mockR2Bucket.put).toHaveBeenCalledTimes(2);
    expect(mockR2Bucket.put).toHaveBeenCalledWith(
      "images/testuser/image123.avif",
      Buffer.from("original-buffer").buffer,
      {
        httpMetadata: {
          contentType: "image/avif",
          cacheControl: "public, max-age=31536000",
        },
      },
    );
    expect(mockR2Bucket.put).toHaveBeenCalledWith(
      "images/testuser/image123_thumbnail.avif",
      Buffer.from("thumbnail-buffer").buffer,
      {
        httpMetadata: {
          contentType: "image/avif",
          cacheControl: "public, max-age=31536000",
        },
      },
    );
  });
});

describe("uploadAvatarImage", () => {
  const mockR2Bucket = {
    put: vi.fn(),
  } as unknown as R2Bucket;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("アバターをR2にアップロードする", async () => {
    await uploadAvatarImage(mockR2Bucket, {
      type: "avatar",
      imageBuffer: Buffer.from("avatar"),
      userId: "testuser",
    });

    expect(mockR2Bucket.put).toHaveBeenCalledWith("avatars/testuser.avif", Buffer.from("avatar-buffer").buffer, {
      httpMetadata: {
        contentType: "image/avif",
        cacheControl: "public, max-age=31536000",
      },
    });
  });
});
