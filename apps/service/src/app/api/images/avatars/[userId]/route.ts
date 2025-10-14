import { getCloudflareContext } from "@opennextjs/cloudflare";
import { type NextRequest, NextResponse } from "next/server";
import { generateR2Key } from "@/lib/r2";

export const runtime = "edge";

type Params = {
  userId: string;
};

/** アバター画像のキャッシュ期間 (1日) */
const CDN_CACHE_PUBLIC = 86400;

export async function GET(_req: NextRequest, { params }: { params: Promise<Params> }) {
  const { userId } = await params;
  const { env } = getCloudflareContext();

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
