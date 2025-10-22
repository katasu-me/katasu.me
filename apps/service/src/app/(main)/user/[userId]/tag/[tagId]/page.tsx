import { fetchTagById } from "@katasu.me/service-db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache, Suspense } from "react";
import { fallback, object, parse, string } from "valibot";
import { cachedFetchPublicUserDataById } from "@/app/_lib/cached-user-data";
import Header from "@/components/Header";
import { Loading } from "@/components/Loading";
import { DEFAULT_AVATAR_URL } from "@/constants/image";
import { SITE_DESCRIPTION_LONG } from "@/constants/site";
import { getUserSession } from "@/lib/auth";
import { generateMetadataTitle } from "@/lib/meta";
import { getUserAvatarUrl } from "@/lib/r2";
import UserImageDropArea from "../../_components/UserImageDropArea";
import { GalleryViewSchema } from "../../_schemas/view";
import TagPageContents from "./_components/TagPageContents";

const cachedFetchTagById = cache(async (tagId: string) => {
  const { env } = getCloudflareContext();
  return fetchTagById(env.DB, tagId);
});

const searchParamsSchema = object({
  view: fallback(GalleryViewSchema, "timeline"),
  page: fallback(string(), "1"),
});

export async function generateMetadata({ params }: PageProps<"/user/[userId]/tag/[tagId]">): Promise<Metadata> {
  const { userId, tagId } = await params;

  const fetchTagResult = await cachedFetchTagById(tagId);

  if (!fetchTagResult.success || !fetchTagResult.data) {
    notFound();
  }

  const tag = fetchTagResult.data;

  const userResult = await cachedFetchPublicUserDataById(tag.userId);

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
  const avatarUrl = user.hasAvatar ? getUserAvatarUrl(user.id, user.avatarSetAt) : DEFAULT_AVATAR_URL;

  return generateMetadataTitle({
    pageTitle: `#${tag.name} - ${user.name}`,
    description: SITE_DESCRIPTION_LONG,
    imageUrl: avatarUrl,
    twitterCard: "summary",
    path: `/user/${userId}/tag/${tagId}`,
    noindex: true,
  });
}

export default async function TagPage({ params, searchParams }: PageProps<"/user/[userId]/tag/[tagId]">) {
  const { userId, tagId } = await params;
  const { env } = getCloudflareContext();

  // タグを取得
  const fetchTagResult = await cachedFetchTagById(tagId);

  if (!fetchTagResult.success) {
    console.error("[page] タグの取得に失敗しました:", fetchTagResult.error);
    notFound();
  }

  // タグが存在しない場合は404
  if (!fetchTagResult.data) {
    notFound();
  }

  const tag = fetchTagResult.data;

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
  const isOwner = user.id === session?.user?.id;

  const { view, page: pageStr } = parse(searchParamsSchema, await searchParams);
  const currentPage = Number.parseInt(pageStr, 10);

  if (currentPage <= 0) {
    notFound();
  }

  return (
    <div className="col-span-full grid grid-cols-subgrid gap-y-12 py-16">
      <Header user={user} rightMenu={session?.user?.id ? { loggedInUserId: session.user.id } : undefined} />

      <h1 className="col-start-2 text-4xl">{`#${tag.name}`}</h1>

      <div className="col-span-full grid grid-cols-subgrid gap-y-8">
        {isOwner && (
          <Suspense>
            <UserImageDropArea userId={userId} maxPhotos={user.plan.maxPhotos} />
          </Suspense>
        )}

        <Suspense fallback={<Loading className="col-start-2 py-16" />}>
          <TagPageContents tag={tag} view={view} currentPage={currentPage} />
        </Suspense>
      </div>
    </div>
  );
}
