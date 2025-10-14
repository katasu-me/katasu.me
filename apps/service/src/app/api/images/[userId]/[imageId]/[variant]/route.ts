import { checkImageStatus, type ImageStatus } from "@katasu.me/service-db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { type NextRequest, NextResponse } from "next/server";
import { generateR2Key } from "@/lib/r2";

type Params = {
  userId: string;
  imageId: string;
  variant: string;
};

type CachedImageStatus = ImageStatus & {
  updatedAt: number;
};

/** KVのキャッシュ期間 (1分) */
const KV_TTL = 60;

/** 公開画像のキャッシュ期間 (1年) */
const CDN_CACHE_PUBLIC = 31536000;

/** 非公開画像のキャッシュ期間 (1分) */
const CDN_CACHE_HIDDEN = 60;

export async function GET(_req: NextRequest, { params }: { params: Promise<Params> }) {
  const { userId, imageId, variant } = await params;

  // variantバリデーション
  if (variant !== "original" && variant !== "thumbnail") {
    return new NextResponse("Invalid variant", { status: 400 });
  }

  const { env } = getCloudflareContext();

  const kvKey = `image_status:${imageId}`;
  let status: ImageStatus;

  const cachedStatus = await env.IMAGE_STATUS_KV.get<CachedImageStatus>(kvKey, "json");

  if (cachedStatus && Date.now() - cachedStatus.updatedAt < KV_TTL * 1000) {
    // キャッシュが有効ならそのまま
    status = cachedStatus;
  } else {
    // キャッシュ切れなら再度DBに問い合せて確認
    const statusResult = await checkImageStatus(env.DB, imageId, userId);

    if (!statusResult.success) {
      console.error("[checkImageStatus] エラー:", statusResult.error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }

    status = statusResult.data;

    // アクセス可否ステータスをKVに保存
    const cachedData: CachedImageStatus = {
      ...status,
      updatedAt: Date.now(),
    };

    await env.IMAGE_STATUS_KV.put(kvKey, JSON.stringify(cachedData), {
      expirationTtl: KV_TTL,
    });
  }

  // アクセス不可なら404
  if (!status.exists) {
    return new NextResponse("Not Found", { status: 404 });
  }

  // 非表示 or BANユーザー
  if (status.hidden || status.userBanned) {
    return new NextResponse("Not Found", {
      status: 404,
      headers: {
        "Cache-Control": `public, max-age=${CDN_CACHE_HIDDEN}`,
      },
    });
  }

  // R2から画像取得
  const key = generateR2Key("image", userId, imageId, variant);
  const object = await env.IMAGES_R2_BUCKET.get(key);

  if (!object) {
    return new NextResponse("Not Found", { status: 404 });
  }

  return new NextResponse(object.body, {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": `public, max-age=${CDN_CACHE_PUBLIC}, immutable`,
      ETag: object.etag || "",
    },
  });
}
