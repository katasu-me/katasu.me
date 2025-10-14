import { getCloudflareContext } from "@opennextjs/cloudflare";
import { type NextRequest, NextResponse } from "next/server";
import { generateR2Key } from "@/lib/r2";

type Params = {
  userId: string;
};

/** アバター画像のキャッシュ期間 (1日) */
const CDN_CACHE_PUBLIC = 86400;

export async function GET(_req: NextRequest, { params }: { params: Promise<Params> }) {
  const { userId } = await params;
  const { env } = getCloudflareContext();

  // レートリミット (100リクエスト/分)
  const clientIp = _req.headers.get("cf-connecting-ip") || "unknown";
  const { success } = await env.IMAGE_RATE_LIMITER.limit({ key: `avatar:${clientIp}` });

  if (!success) {
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: {
        "Retry-After": "60",
      },
    });
  }

  // R2からアバター取得
  const key = generateR2Key("avatar", userId);
  const object = await env.IMAGES_R2_BUCKET.get(key);

  // 存在しなければ404
  if (!object) {
    return new NextResponse("Not Found", { status: 404 });
  }

  return new NextResponse(object.body, {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": `public, max-age=${CDN_CACHE_PUBLIC}`,
      ETag: object.etag || "",
    },
  });
}
