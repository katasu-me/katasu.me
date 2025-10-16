import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { cachedFetchPublicUserDataById } from "@/app/_lib/cached-user-data";
import Header from "@/components/Header";
import { Loading } from "@/components/Loading";
import { getUserSession } from "@/lib/auth";
import { generateMetadataTitle } from "@/lib/meta";
import { getImageUrl } from "@/lib/r2";
import ImagePageContent from "./_components/ImagePageContent";
import { cachedFetchImageById } from "./_lib/fetch-image-by-id";

export async function generateMetadata({ params }: PageProps<"/user/[userId]/image/[imageId]">): Promise<Metadata> {
  const { userId, imageId } = await params;

  // ユーザー情報と画像情報
  const [userResult, fetchImage] = await Promise.all([
    cachedFetchPublicUserDataById(userId),
    cachedFetchImageById(imageId),
  ]);

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

  return generateMetadataTitle({
    pageTitle: image.title ? `${image.title} - ${userResult.data.name}` : userResult.data.name,
    description,
    imageUrl,
    path: `/user/${userId}/image/${imageId}`,
    noindex: true,
  });
}

export default async function ImagesPage({ params }: PageProps<"/user/[userId]/image/[imageId]">) {
  const { userId, imageId } = await params;
  const { env } = getCloudflareContext();

  const [userResult, { session }] = await Promise.all([cachedFetchPublicUserDataById(userId), getUserSession(env.DB)]);

  // 存在しない、または新規登録が完了していない場合は404
  if (
    !userResult.success ||
    !userResult.data ||
    !userResult.data.termsAgreedAt ||
    !userResult.data.privacyPolicyAgreedAt
  ) {
    notFound();
  }

  const user = userResult.data;
  const canEdit = session?.user.id === user.id;

  return (
    <div className="col-span-full grid grid-cols-subgrid gap-y-12 py-16">
      <Header user={user} />
      <Suspense fallback={<Loading className="col-start-2 py-16" />}>
        <ImagePageContent authorUserId={userId} imageId={imageId} canEdit={canEdit} />
      </Suspense>
    </div>
  );
}
