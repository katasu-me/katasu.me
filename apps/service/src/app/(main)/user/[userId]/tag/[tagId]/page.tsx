import { fetchTagById } from "@katasu.me/service-db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { unstable_cacheTag as cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { fallback, object, parse, string } from "valibot";
import { cachedFetchUserById } from "@/actions/user";
import IconDots from "@/assets/icons/dots.svg";
import IconSearch from "@/assets/icons/search.svg";
import Header from "@/components/Header";
import IconButton from "@/components/IconButton";
import { GalleryViewSchema } from "@/features/gallery/components/GalleryView";
import TagPageContents from "./_components/TagPageContents";

const searchParamsSchema = object({
  view: fallback(GalleryViewSchema, "masonry"),
  page: fallback(string(), "1"),
});

const cachedFetchTagById = async (userId: string, tagId: string) => {
  "use cache";

  cacheTag(`/user/${userId}/tag/${tagId}`);

  const { env } = getCloudflareContext();

  return fetchTagById(env.DB, tagId);
};

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

  // ユーザーを取得
  const user = await cachedFetchUserById(tag.userId);

  // ユーザーが存在しない場合は404
  if (!user) {
    notFound();
  }

  const { view, page: rawPage } = parse(searchParamsSchema, await searchParams);
  const currentPage = Number.parseInt(rawPage, 10);

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
        <TagPageContents tag={tag} view={view} currentPage={currentPage} />
      </div>
    </div>
  );
}
