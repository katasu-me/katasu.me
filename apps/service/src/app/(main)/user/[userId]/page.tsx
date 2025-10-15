import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { fallback, object, parse, string } from "valibot";
import IconDots from "@/assets/icons/dots.svg";
import IconSearch from "@/assets/icons/search.svg";
import Header from "@/components/Header";
import IconButton from "@/components/IconButton";
import { Loading } from "@/components/Loading";
import TagLinksSkeleton from "@/components/Navigation/TagLinks/Skeleton";
import { SITE_DESCRIPTION_LONG } from "@/constants/site";
import ImageDropArea from "@/features/gallery/components/ImageDropArea";
import { GalleryViewSchema } from "@/features/gallery/schemas/view";
import { getUserSession } from "@/lib/auth";
import { getUserAvatarUrl } from "@/lib/image";
import { generateMetadataTitle } from "@/lib/meta";
import { cachedFetchPublicUserDataById, cachedFetchTotalImageCount } from "@/lib/user";
import UserPageContents from "./_components/UserPageContents";
import UserTagLinks from "./_components/UserTagLinks";

const searchParamsSchema = object({
  view: fallback(GalleryViewSchema, "timeline"),
  page: fallback(string(), "1"),
});

export async function generateMetadata({ params }: PageProps<"/user/[userId]">): Promise<Metadata> {
  const startTime = Date.now();
  console.log("[DEBUG] generateMetadata - START");

  const { userId } = await params;

  console.log("[DEBUG] generateMetadata - cachedFetchPublicUserDataById - START");
  const userFetchStart = Date.now();
  const userResult = await cachedFetchPublicUserDataById(userId);
  console.log(`[DEBUG] generateMetadata - cachedFetchPublicUserDataById - END: ${Date.now() - userFetchStart}ms`);

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
  const avatarUrl = getUserAvatarUrl(user.id, user.hasAvatar);

  console.log(`[DEBUG] generateMetadata - END: ${Date.now() - startTime}ms\n`);

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
  const pageStartTime = Date.now();
  console.log("[DEBUG] UserPage - START");

  // ユーザーページのユーザーを取得
  const { userId } = await params;

  console.log("[DEBUG] UserPage - cachedFetchPublicUserDataById - START");
  const userFetchStart = Date.now();
  const userResult = await cachedFetchPublicUserDataById(userId);
  console.log(`[DEBUG] UserPage - cachedFetchPublicUserDataById - END: ${Date.now() - userFetchStart}ms`);

  // 存在しない、または新規登録が完了していない場合は404
  if (
    !userResult.success ||
    !userResult.data ||
    !userResult.data.termsAgreedAt ||
    !userResult.data.privacyPolicyAgreedAt
  ) {
    notFound();
  }

  const { env } = getCloudflareContext();

  console.log("[DEBUG] UserPage - getUserSession + cachedFetchTotalImageCount - START");
  const parallelFetchStart = Date.now();
  const [{ session }, totalImageCount] = await Promise.all([
    getUserSession(env.DB),
    cachedFetchTotalImageCount(userId),
  ]);
  console.log(
    `[DEBUG] UserPage - getUserSession + cachedFetchTotalImageCount - END: ${Date.now() - parallelFetchStart}ms`,
  );

  const user = userResult.data;
  const isOwner = user.id === session?.user?.id;

  console.log("[DEBUG] UserPage - parse searchParams - START");
  const parseStart = Date.now();
  const { view, page: pageStr } = parse(searchParamsSchema, await searchParams);
  const currentPage = Number.parseInt(pageStr, 10);

  if (currentPage <= 0) {
    notFound();
  }

  console.log(`[DEBUG] UserPage - parse searchParams - END: ${Date.now() - parseStart}ms`);
  console.log(`[DEBUG] UserPage - END (excluding Suspense components): ${Date.now() - pageStartTime}ms\n`);

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

      <div className="col-span-full grid grid-cols-subgrid gap-y-8">
        <Suspense fallback={<TagLinksSkeleton className="col-start-2" />}>
          <UserTagLinks className="col-start-2" userId={userId} />
        </Suspense>

        {isOwner && (
          <div className="col-start-2">
            <ImageDropArea
              title="あたらしい画像を投稿する"
              counter={{
                total: totalImageCount,
                max: user.maxPhotos,
              }}
            />
          </div>
        )}

        <Suspense fallback={<Loading className="col-start-2 py-16" />}>
          <UserPageContents user={user} view={view} totalImageCount={totalImageCount} currentPage={currentPage} />
        </Suspense>
      </div>
    </div>
  );
}
