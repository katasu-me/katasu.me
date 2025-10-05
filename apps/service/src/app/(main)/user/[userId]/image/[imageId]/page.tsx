import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cachedFetchUserById } from "@/actions/user";
import Header from "@/components/Header";
import { getUserSession } from "@/lib/auth";
import { generateMetadataTitle } from "@/lib/meta";
import ImagePageContent from "./_components/ImagePageContent";
import { DEFAULT_IMAGE_TITLE } from "./_constants/title";
import { cachedFetchImage } from "./_lib/fetch";

export async function generateMetadata({ params }: PageProps<"/user/[userId]/image/[imageId]">): Promise<Metadata> {
  const { userId, imageId } = await params;

  const user = await cachedFetchUserById(userId);

  if (!user) {
    notFound();
  }

  const fetchImage = await cachedFetchImage(userId, imageId);

  if (!fetchImage.success || !fetchImage.data) {
    notFound();
  }

  const title = fetchImage.data.title ?? DEFAULT_IMAGE_TITLE;

  return generateMetadataTitle({
    pageTitle: `${title} - ${user.name}`,
  });
}

export default async function ImagesPage({ params }: PageProps<"/user/[userId]/image/[imageId]">) {
  const { userId, imageId } = await params;

  const user = await cachedFetchUserById(userId);

  // ユーザーが存在しない場合は404
  if (!user) {
    notFound();
  }

  const { env } = getCloudflareContext();
  const { session } = await getUserSession(env.DB);

  const canEdit = session?.user.id === user.id;

  return (
    <div className="col-span-full grid grid-cols-subgrid gap-y-12 py-16">
      <Header user={user} />
      <ImagePageContent authorUserId={userId} imageId={imageId} canEdit={canEdit} />
    </div>
  );
}
