import { fetchTagsByUserId } from "@katasu.me/service-db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Metadata } from "next";
import { unstable_cacheTag as cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { fallback, object, parse, string } from "valibot";
import { cachedFetchUserById } from "@/actions/user";
import IconDots from "@/assets/icons/dots.svg";
import IconSearch from "@/assets/icons/search.svg";
import Header from "@/components/Header";
import IconButton from "@/components/IconButton";
import TagLinks from "@/components/Navigation/TagLinks";
import { GalleryViewSchema } from "@/features/gallery/schemas/view";
import { userPageCacheTag } from "@/lib/cache-tags";
import { generateMetadataTitle } from "@/lib/meta";
import UserPageContents from "./_components/UserPageContents";

const cachedFetchTags = async (userId: string) => {
  "use cache";

  cacheTag(userPageCacheTag(userId));

  const { env } = getCloudflareContext();

  return fetchTagsByUserId(env.DB, userId, {
    limit: 4,
    order: "usage",
  });
};

const searchParamsSchema = object({
  view: fallback(GalleryViewSchema, "masonry"),
  page: fallback(string(), "1"),
});

export async function generateMetadata({ params }: PageProps<"/user/[userId]">): Promise<Metadata> {
  const { userId } = await params;

  const user = await cachedFetchUserById(userId);

  if (!user) {
    notFound();
  }

  return generateMetadataTitle({
    pageTitle: user.name,
  });
}

export default async function UserPage({ params, searchParams }: PageProps<"/user/[userId]">) {
  const { userId } = await params;

  const user = await cachedFetchUserById(userId);

  // ユーザーが存在しない場合は404
  if (!user) {
    notFound();
  }

  const fetchTagsResult = await cachedFetchTags(userId);

  const tags = fetchTagsResult.success ? fetchTagsResult.data : [];

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
        <UserPageContents user={user} view={view} currentPage={currentPage} />
      </div>
    </div>
  );
}
