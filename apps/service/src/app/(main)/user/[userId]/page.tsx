import { getPublicUserDataById } from "@katasu.me/service-db";
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
import TagLinksSkeleton from "@/components/Navigation/TagLinks/Skeleton";
import { DEFAULT_AVATAR_URL } from "@/constants/image";
import { SITE_DESCRIPTION_LONG } from "@/constants/site";
import { GalleryViewSchema } from "@/features/gallery/schemas/view";
import { generateMetadataTitle } from "@/lib/meta";
import { getUserAvatarUrl } from "@/lib/r2";
import UserImageDropArea from "./_components/UserImageDropArea";
import UserPageContents from "./_components/UserPageContents";
import UserTagLinks from "./_components/UserTagLinks";

const fetchPublicUserDataById = cache(async (userId: string) => {
  const { env } = getCloudflareContext();
  return await getPublicUserDataById(env.DB, userId);
});

const searchParamsSchema = object({
  view: fallback(GalleryViewSchema, "timeline"),
  page: fallback(string(), "1"),
});

export const revalidate = 3600; // 1時間

export async function generateMetadata({ params }: PageProps<"/user/[userId]">): Promise<Metadata> {
  const { userId } = await params;
  console.log(`[CACHE] generateMetadata called for user: ${userId} at ${new Date().toISOString()}`);

  const userResult = await fetchPublicUserDataById(userId);

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
  const pageStartTime = Date.now();
  const timestamp = new Date().toISOString();
  console.log("\n========================================");
  console.log(`[CACHE] UserPage RENDER - ${timestamp}`);
  console.log("========================================");

  // ユーザーページのユーザーを取得
  const { userId } = await params;
  console.log(`[CACHE] Fetching user data for: ${userId}`);

  const userFetchStart = Date.now();
  const userResult = await fetchPublicUserDataById(userId);
  console.log(`[CACHE] User data fetched in ${Date.now() - userFetchStart}ms`);

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

        <Suspense>
          <UserImageDropArea userId={userId} maxPhotos={user.maxPhotos} />
        </Suspense>

        <Suspense fallback={<Loading className="col-start-2 py-16" />}>
          <UserPageContents user={user} view={view} currentPage={currentPage} />
        </Suspense>
      </div>
    </div>
  );
}
