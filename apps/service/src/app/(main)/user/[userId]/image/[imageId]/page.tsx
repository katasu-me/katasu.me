import { fetchPublicUserDataById } from "@katasu.me/service-db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache, Suspense } from "react";
import Header from "@/components/Header";
import { Loading } from "@/components/Loading";
import { getUserSession } from "@/lib/auth";
import { generateMetadataTitle } from "@/lib/meta";
import { getImageUrl } from "@/lib/r2";
import ImagePageContent from "./_components/ImagePageContent";
import { cachedFetchImageById } from "./_lib/fetch-image-by-id";

const cachedFetchPublicUserDataById = cache(async (userId: string) => {
  const { env } = getCloudflareContext();
  return await fetchPublicUserDataById(env.DB, userId);
});

export async function generateMetadata({ params }: PageProps<"/user/[userId]/image/[imageId]">): Promise<Metadata> {
  const startTime = Date.now();
  console.log("[DEBUG] generateMetadata (ImagePage) - START");

  const { userId, imageId } = await params;

  // ユーザー情報と画像情報
  console.log("[DEBUG] generateMetadata (ImagePage) - fetchPublicUserDataById + fetchImageById - START");
  const parallelFetchStart = Date.now();
  const [userResult, fetchImage] = await Promise.all([
    cachedFetchPublicUserDataById(userId),
    cachedFetchImageById(imageId),
  ]);
  console.log(
    `[DEBUG] generateMetadata (ImagePage) - fetchPublicUserDataById + fetchImageById - END: ${Date.now() - parallelFetchStart}ms`,
  );

  // 存在しない、または新規登録が完了していない場合は404
  if (
    !userResult.success ||
    !userResult.data ||
    !userResult.data.termsAgreedAt ||
    !userResult.data.privacyPolicyAgreedAt
  ) {
    notFound();
  }

  if (!fetchImage.success || !fetchImage.data) {
    notFound();
  }

  const image = fetchImage.data;

  const description = image.tags.length > 0 ? image.tags.map((tag) => `#${tag.name}`).join(" ") : undefined;
  const imageUrl = getImageUrl(userId, imageId, "original");

  console.log(`[DEBUG] generateMetadata (ImagePage) - END: ${Date.now() - startTime}ms\n`);

  return generateMetadataTitle({
    pageTitle: image.title ? `${image.title} - ${userResult.data.name}` : userResult.data.name,
    description,
    imageUrl,
    path: `/user/${userId}/image/${imageId}`,
    noindex: true,
  });
}

export default async function ImagesPage({ params }: PageProps<"/user/[userId]/image/[imageId]">) {
  const pageStartTime = Date.now();
  console.log("[DEBUG] ImagesPage - START");

  const { userId, imageId } = await params;
  const { env } = getCloudflareContext();

  console.log("[DEBUG] ImagesPage - fetchPublicUserDataById - START");
  const userFetchStart = Date.now();
  const userResult = await cachedFetchPublicUserDataById(userId);
  console.log(`[DEBUG] ImagesPage - fetchPublicUserDataById - END: ${Date.now() - userFetchStart}ms`);

  // 存在しない、または新規登録が完了していない場合は404
  if (
    !userResult.success ||
    !userResult.data ||
    !userResult.data.termsAgreedAt ||
    !userResult.data.privacyPolicyAgreedAt
  ) {
    notFound();
  }

  console.log("[DEBUG] ImagesPage - getUserSession - START");
  const sessionStart = Date.now();
  const { session } = await getUserSession(env.DB);
  console.log(`[DEBUG] ImagesPage - getUserSession - END: ${Date.now() - sessionStart}ms`);

  const user = userResult.data;
  const canEdit = session?.user.id === user.id;

  console.log(`[DEBUG] ImagesPage - END (excluding Suspense components): ${Date.now() - pageStartTime}ms\n`);

  return (
    <div className="col-span-full grid grid-cols-subgrid gap-y-12 py-16">
      <Header user={user} />
      <Suspense fallback={<Loading className="col-start-2 py-16" />}>
        <ImagePageContent authorUserId={userId} imageId={imageId} canEdit={canEdit} />
      </Suspense>
    </div>
  );
}
