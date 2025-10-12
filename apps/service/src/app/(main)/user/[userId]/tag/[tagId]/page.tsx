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
import ImageDropArea from "@/features/gallery/components/ImageDropArea";
import { GalleryViewSchema } from "@/features/gallery/schemas/view";
import { getUserSession } from "@/lib/auth";
import { tagPageCacheTag } from "@/lib/cache-tags";
import { generateMetadataTitle } from "@/lib/meta";
import { cachedFetchUserById } from "@/lib/user";
import TagPageContents from "./_components/TagPageContents";

const searchParamsSchema = object({
  view: fallback(GalleryViewSchema, "timeline"),
  page: fallback(string(), "1"),
});

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
  const user = await cachedFetchUserById(tag.userId);

  if (!user) {
    notFound();
  }

  return generateMetadataTitle({
    pageTitle: `#${tag.name} - ${user.name}`,
    noindex: true,
  });
}

export default async function TagPage({ params, searchParams }: PageProps<"/user/[userId]/tag/[tagId]">) {
  const { userId, tagId } = await params;

  // タグを取得
  const fetchTagResult = await cachedFetchTagById(userId, tagId);

  if (!fetchTagResult.success) {
    console.error("Failed to fetch tag:", fetchTagResult.error);
    notFound();
  }

  // タグが存在しない場合は404
  if (!fetchTagResult.data) {
    notFound();
  }

  const tag = fetchTagResult.data;

  // ユーザーページのユーザーを取得
  const user = await cachedFetchUserById(tag.userId);

  // 存在しない場合は404
  if (!user) {
    notFound();
  }

  // ログイン中のユーザーを取得
  const { env } = getCloudflareContext();
  const { session } = await getUserSession(env.DB);
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

      <h1 className="col-start-2 text-4xl">{`#${tag.name}`}</h1>

      <div className="col-span-full grid grid-cols-subgrid gap-y-8">
        {isOwner && (
          <div className="col-start-2">
            <ImageDropArea title="あたらしい画像を投稿する" />
          </div>
        )}

        <Suspense fallback={<Loading className="col-start-2 py-16" />}>
          <TagPageContents tag={tag} view={view} currentPage={currentPage} />
        </Suspense>
      </div>
    </div>
  );
}
