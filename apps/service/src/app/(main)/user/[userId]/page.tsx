import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { fallback, object, parse, string } from "valibot";
import { cachedFetchPublicUserDataById } from "@/app/_lib/cached-user-data";
import Header from "@/components/Header";
import { Loading } from "@/components/Loading";
import TagLinksSkeleton from "@/components/TagLinks/Skeleton";
import { DEFAULT_AVATAR_URL } from "@/constants/image";
import { SITE_DESCRIPTION_LONG } from "@/constants/site";
import { GalleryViewSchema } from "@/features/gallery/schemas/view";
import { getUserSession } from "@/lib/auth";
import { generateMetadataTitle } from "@/lib/meta";
import { getUserAvatarUrl } from "@/lib/r2";
import UserImageDropArea from "./_components/UserImageDropArea";
import UserPageContents from "./_components/UserPageContents";
import UserTagLinks from "./_components/UserTagLinks";

const searchParamsSchema = object({
  view: fallback(GalleryViewSchema, "timeline"),
  page: fallback(string(), "1"),
});

export async function generateMetadata({ params }: PageProps<"/user/[userId]">): Promise<Metadata> {
  const { userId } = await params;

  const userResult = await cachedFetchPublicUserDataById(userId);

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
  const avatarUrl = user.hasAvatar ? getUserAvatarUrl(user.id) : DEFAULT_AVATAR_URL;

  return generateMetadataTitle({
    pageTitle: user.name,
    description: SITE_DESCRIPTION_LONG,
    imageUrl: avatarUrl,
    twitterCard: "summary",
    path: `/user/${userId}`,
    noindex: false, // ユーザーページのみインデックスさせる
  });
}

export default async function UserPage({ params, searchParams }: PageProps<"/user/[userId]">) {
  const { userId } = await params;
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
  const isOwner = userId === session?.user?.id;

  const { view, page: pageStr } = parse(searchParamsSchema, await searchParams);
  const currentPage = Number.parseInt(pageStr, 10);

  if (currentPage <= 0) {
    notFound();
  }

  return (
    <div className="col-span-full grid grid-cols-subgrid gap-y-12 py-16">
      <Header user={user} showRightMenu isOwnerPage={isOwner} />

      <div className="col-span-full grid grid-cols-subgrid gap-y-8">
        <Suspense fallback={<TagLinksSkeleton className="col-start-2" />}>
          <UserTagLinks className="col-start-2" userId={userId} />
        </Suspense>

        {isOwner && (
          <Suspense>
            <UserImageDropArea userId={userId} maxPhotos={user.plan.maxPhotos} />
          </Suspense>
        )}

        <Suspense fallback={<Loading className="col-start-2 py-16" />}>
          <UserPageContents user={user} view={view} currentPage={currentPage} />
        </Suspense>
      </div>
    </div>
  );
}
