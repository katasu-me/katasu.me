import { fetchTagById } from "@katasu.me/service-db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Metadata } from "next";
import { unstable_cacheTag as cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { fallback, object, parse, string } from "valibot";
import IconDots from "@/assets/icons/dots.svg";
import IconSearch from "@/assets/icons/search.svg";
import Header from "@/components/Header";
import IconButton from "@/components/IconButton";
import { Loading } from "@/components/Loading";
import { SITE_DESCRIPTION_LONG } from "@/constants/site";
import ImageDropArea from "@/features/gallery/components/ImageDropArea";
import { GalleryViewSchema } from "@/features/gallery/schemas/view";
import { getUserSession } from "@/lib/auth";
import { tagPageCacheTag } from "@/lib/cache-tags";
import { getUserAvatarUrl } from "@/lib/image";
import { generateMetadataTitle } from "@/lib/meta";
import { cachedFetchPublicUserDataById, cachedFetchTotalImageCount } from "@/lib/user";
import TagPageContents from "./_components/TagPageContents";

const searchParamsSchema = object({
  view: fallback(GalleryViewSchema, "timeline"),
  page: fallback(string(), "1"),
});

/**
 * タグ情報を取得
 * @params userId ユーザーIO
 * @params tagId タグID
 * @returns タグ情報
 */
const cachedFetchTagById = async (userId: string, tagId: string) => {
  "use cache";

  cacheTag(tagPageCacheTag(userId, tagId));

  const { env } = getCloudflareContext();

  return fetchTagById(env.DB, tagId);
};

export async function generateMetadata({ params }: PageProps<"/user/[userId]/tag/[tagId]">): Promise<Metadata> {
  const { userId, tagId } = await params;

  const fetchTagResult = await cachedFetchTagById(userId, tagId);

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
  const avatarUrl = getUserAvatarUrl(user.id, user.hasAvatar);

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

  // タグを取得
  const fetchTagResult = await cachedFetchTagById(userId, tagId);

  if (!fetchTagResult.success) {
    console.error("[page] タグの取得に失敗しました:", fetchTagResult.error);
    notFound();
  }

  // タグが存在しない場合は404
  if (!fetchTagResult.data) {
    notFound();
  }

  const { env } = getCloudflareContext();
  const tag = fetchTagResult.data;

  const [userResult, totalImageCount, { session }] = await Promise.all([
    cachedFetchPublicUserDataById(tag.userId),
    cachedFetchTotalImageCount(userId),
    getUserSession(env.DB),
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
