import { notFound } from "next/navigation";
import { cachedFetchUserById } from "@/actions/user";
import Header from "@/components/Header";
import ImagePageContent from "./_components/ImagePageContent";

export default async function ImagesPage({ params }: PageProps<"/user/[userId]/image/[imageId]">) {
  const { userId, imageId } = await params;

  const user = await cachedFetchUserById(userId);

  // ユーザーが存在しない場合は404
  if (!user) {
    notFound();
  }

  return (
    <div className="col-span-full grid grid-cols-subgrid gap-y-12 py-16">
      <Header user={user} />
      <ImagePageContent userId={userId} imageId={imageId} />
    </div>
  );
}
