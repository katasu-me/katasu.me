import { getCloudflareContext } from "@opennextjs/cloudflare";
import { notFound } from "next/navigation";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ key: string[] }> }) {
  // 本番なら404に
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  const { env } = getCloudflareContext();
  const resolvedParams = await params;
  const key = resolvedParams.key.join("/");

  console.log("[DEV] Fetching file from R2 with key:", key);

  try {
    const object = await env.IMAGES_R2_BUCKET.get(key);

    if (!object) {
      return new NextResponse("File not found", { status: 404 });
    }

    return new NextResponse(object.body);
  } catch (error) {
    console.error("[DEV] Error fetching file from R2:", error);

    return new NextResponse("Error fetching file", { status: 500 });
  }
}
