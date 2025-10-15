import { fetchPublicUserDataById, fetchTagById, fetchTotalImageCountByUserId } from "@katasu.me/service-db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache, Suspense } from "react";
import { fallback, object, parse, string } from "valibot";
import IconDots from "@/assets/icons/dots.svg";
import IconSearch from "@/assets/icons/search.svg";
import Header from "@/components/Header";
import IconButton from "@/components/IconButton";
import { Loading } from "@/components/Loading";
import { DEFAULT_AVATAR_URL } from "@/constants/image";
import { SITE_DESCRIPTION_LONG } from "@/constants/site";
import ImageDropArea from "@/features/gallery/components/ImageDropArea";
import { GalleryViewSchema } from "@/features/gallery/schemas/view";
import { getUserSession } from "@/lib/auth";
import { generateMetadataTitle } from "@/lib/meta";
import { getUserAvatarUrl } from "@/lib/r2";
import TagPageContents from "./_components/TagPageContents";

const cachedFetchTagById = cache(async (tagId: string) => {
  const { env } = getCloudflareContext();
  return fetchTagById(env.DB, tagId);
});

const cachedFetchPublicUserDataById = cache(async (userId: string) => {
  const { env } = getCloudflareContext();
  return fetchPublicUserDataById(env.DB, userId);
});

const searchParamsSchema = object({
  view: fallback(GalleryViewSchema, "timeline"),
  page: fallback(string(), "1"),
});

export async function generateMetadata({ params }: PageProps<"/user/[userId]/tag/[tagId]">): Promise<Metadata> {
  const startTime = Date.now();
  console.log("[DEBUG] generateMetadata (TagPage) - START");

  const { userId, tagId } = await params;

  console.log("[DEBUG] generateMetadata (TagPage) - fetchTagById - START");
  const tagFetchStart = Date.now();
  const fetchTagResult = await cachedFetchTagById(tagId);
  console.log(`[DEBUG] generateMetadata (TagPage) - fetchTagById - END: ${Date.now() - tagFetchStart}ms`);

  if (!fetchTagResult.success || !fetchTagResult.data) {
    notFound();
  }

  const tag = fetchTagResult.data;

  console.log("[DEBUG] generateMetadata (TagPage) - fetchPublicUserDataById - START");
  const userFetchStart = Date.now();
  const userResult = await cachedFetchPublicUserDataById(tag.userId);
  console.log(`[DEBUG] generateMetadata (TagPage) - fetchPublicUserDataById - END: ${Date.now() - userFetchStart}ms`);

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

  console.log(`[DEBUG] generateMetadata (TagPage) - END: ${Date.now() - startTime}ms\n`);

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
  const pageStartTime = Date.now();
  console.log("[DEBUG] TagPage - START");

  const { userId, tagId } = await params;
  const { env } = getCloudflareContext();

  // タグを取得
  console.log("[DEBUG] TagPage - fetchTagById - START");
  const tagFetchStart = Date.now();
  const fetchTagResult = await cachedFetchTagById(tagId);
  console.log(`[DEBUG] TagPage - fetchTagById - END: ${Date.now() - tagFetchStart}ms`);

  if (!fetchTagResult.success) {
    console.error("[page] タグの取得に失敗しました:", fetchTagResult.error);
    notFound();
  }

  // タグが存在しない場合は404
  if (!fetchTagResult.data) {
    notFound();
  }

  const tag = fetchTagResult.data;

  console.log("[DEBUG] TagPage - fetchPublicUserDataById + fetchTotalImageCountByUserId + getUserSession - START");
  const parallelFetchStart = Date.now();
  const [userResult, totalImageCountResult, { session }] = await Promise.all([
    cachedFetchPublicUserDataById(userId),
    fetchTotalImageCountByUserId(env.DB, userId),
    getUserSession(env.DB),
  ]);
  console.log(
    `[DEBUG] TagPage - fetchPublicUserDataById + fetchTotalImageCountByUserId + getUserSession - END: ${Date.now() - parallelFetchStart}ms`,
  );

  const totalImageCount = totalImageCountResult.success ? totalImageCountResult.data : 0;

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

  console.log("[DEBUG] TagPage - parse searchParams - START");
  const parseStart = Date.now();
  const { view, page: pageStr } = parse(searchParamsSchema, await searchParams);
  const currentPage = Number.parseInt(pageStr, 10);

  if (currentPage <= 0) {
    notFound();
  }

  console.log(`[DEBUG] TagPage - parse searchParams - END: ${Date.now() - parseStart}ms`);
  console.log(`[DEBUG] TagPage - END (excluding Suspense components): ${Date.now() - pageStartTime}ms\n`);

  return (
    <div className="col-span-full grid grid-cols-subgrid gap-y-12 py-16">
      <Header user={user}>
        {/* TODO: 検索 */}
        <IconButton title="検索">
          <IconSearch className="h-6 w-6 opacity-25" />
        </IconButton>

        {/* TODO: メニュー */}
        <IconButton title="その他">
          <IconDots className="h-6 w-6 opacity-25" />
        </IconButton>
      </Header>

      <h1 className="col-start-2 text-4xl">{`#${tag.name}`}</h1>

      <div className="col-span-full grid grid-cols-subgrid gap-y-8">
        {isOwner && (
          <div className="col-start-2">
            <ImageDropArea
              title="あたらしい画像を投稿する"
              defaultTags={[tag.name]}
              counter={{
                total: totalImageCount,
                max: user.maxPhotos,
              }}
            />
          </div>
        )}

        <Suspense fallback={<Loading className="col-start-2 py-16" />}>
          <TagPageContents tag={tag} view={view} currentPage={currentPage} />
        </Suspense>
      </div>
    </div>
  );
}
