import { fetchTagsByUserId } from "@katasu.me/service-db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Metadata } from "next";
import { unstable_cacheTag as cacheTag, revalidateTag } from "next/cache";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { fallback, object, parse, string } from "valibot";
import IconDots from "@/assets/icons/dots.svg";
import IconSearch from "@/assets/icons/search.svg";
import Header from "@/components/Header";
import IconButton from "@/components/IconButton";
import { Loading } from "@/components/Loading";
import TagLinks from "@/components/Navigation/TagLinks";
import { SITE_DESCRIPTION_LONG } from "@/constants/site";
import ImageDropArea from "@/features/gallery/components/ImageDropArea";
import { GalleryViewSchema } from "@/features/gallery/schemas/view";
import { getUserSession } from "@/lib/auth";
import { tagListCacheTag } from "@/lib/cache-tags";
import { generateMetadataTitle } from "@/lib/meta";
import { getUserAvatarUrl } from "@/lib/r2";
import { cachedFetchTotalImageCount, cachedFetchUserById } from "@/lib/user";
import UserPageContents from "./_components/UserPageContents";

/**
 * 使用頻度の高いタグを取得
 * @params userId ユーザーID
 * @returns タグ一覧
 */
const cachedFetchTags = async (userId: string) => {
  "use cache";

  const tag = tagListCacheTag(userId);
  cacheTag(tag);

  const { env } = getCloudflareContext();

  const result = await fetchTagsByUserId(env.DB, userId, {
    limit: 4,
    order: "usage",
  });

  if (!result.success) {
    revalidateTag(tag);
    return [];
  }

  return result.data;
};

const searchParamsSchema = object({
  view: fallback(GalleryViewSchema, "timeline"),
  page: fallback(string(), "1"),
});

export async function generateMetadata({ params }: PageProps<"/user/[userId]">): Promise<Metadata> {
  const { userId } = await params;

  const userResult = await cachedFetchUserById(userId);

  if (!userResult.success || !userResult.data || !userResult.data.name) {
    notFound();
  }

  const user = userResult.data;
  const avatarUrl = getUserAvatarUrl(user.image);

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
  // ユーザーページのユーザーを取得
  const { userId } = await params;
  const userResult = await cachedFetchUserById(userId);

  // 存在しない場合は404
  if (!userResult.success || !userResult.data || !userResult.data.name) {
    notFound();
  }

  const { env } = getCloudflareContext();

  const [{ session }, totalImageCount, tags] = await Promise.all([
    getUserSession(env.DB),
    cachedFetchTotalImageCount(userId),
    cachedFetchTags(userId),
  ]);

  const user = userResult.data;
  const isOwner = user.id === session?.user?.id;

  const { view, page: pageStr } = parse(searchParamsSchema, await searchParams);
  const currentPage = Number.parseInt(pageStr, 10);

  if (currentPage <= 0) {
    notFound();
  }

  return (
    <div className="col-span-full grid grid-cols-subgrid gap-y-12 py-16">
      <Header user={user}>
        <IconButton title="検索">
          <IconSearch className="h-6 w-6" />
        </IconButton>

        <IconButton title="その他">
          <IconDots className="h-6 w-6" />
        </IconButton>
      </Header>

      <div className="col-span-full grid grid-cols-subgrid gap-y-8">
        {tags.length > 0 && <TagLinks className="col-start-2" tags={tags} userId={userId} />}

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
