import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import { getUserSession } from "@/lib/auth";
import { generateMetadataTitle } from "@/lib/meta";
import { getImageUrl } from "@/lib/r2";
import { cachedFetchUserById } from "@/lib/user";
import ImagePageContent from "./_components/ImagePageContent";
import { DEFAULT_IMAGE_TITLE } from "./_constants/title";
import { cachedFetchImage } from "./_lib/fetch";

export async function generateMetadata({ params }: PageProps<"/user/[userId]/image/[imageId]">): Promise<Metadata> {
  const { userId, imageId } = await params;

  const userResult = await cachedFetchUserById(userId);

  if (!userResult.success || !userResult.data || !userResult.data.name) {
    notFound();
  }

  const fetchImage = await cachedFetchImage(userId, imageId);

  if (!fetchImage.success || !fetchImage.data) {
    notFound();
  }

  const image = fetchImage.data;

  const title = image.title ?? DEFAULT_IMAGE_TITLE;
  const description = image.tags.length > 0 ? image.tags.map((tag) => `#${tag.name}`).join(" ") : undefined;
  const imageUrl = getImageUrl(userId, imageId, "original");

  return generateMetadataTitle({
    pageTitle: `${title} - ${userResult.data.name}`,
    description,
    imageUrl,
    path: `/user/${userId}/image/${imageId}`,
    noindex: true,
  });
}

export default async function ImagesPage({ params }: PageProps<"/user/[userId]/image/[imageId]">) {
  const { userId, imageId } = await params;

  const userResult = await cachedFetchUserById(userId);

  // ユーザーが存在しない場合は404
  if (!userResult.success || !userResult.data || !userResult.data.name) {
    notFound();
  }

  const { env } = getCloudflareContext();
  const { session } = await getUserSession(env.DB);

  const user = userResult.data;
  const canEdit = session?.user.id === user.id;

  return (
    <div className="col-span-full grid grid-cols-subgrid gap-y-12 py-16">
      <Header user={user} />
      <ImagePageContent authorUserId={userId} imageId={imageId} canEdit={canEdit} />
    </div>
  );
}
