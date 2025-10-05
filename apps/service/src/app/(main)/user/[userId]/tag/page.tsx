import { fetchTagsByUserId } from "@katasu.me/service-db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Metadata } from "next";
import { unstable_cacheTag as cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { cachedFetchUserById } from "@/actions/user";
import Header from "@/components/Header";
import Message from "@/components/Message";
import TagLink from "@/components/Navigation/TagLinks/TabLink";
import { userPageCacheTag } from "@/lib/cache-tags";
import { generateMetadataTitle } from "@/lib/meta";

const cachedFetchAllTags = async (userId: string) => {
  "use cache";

  cacheTag(userPageCacheTag(userId));

  const { env } = getCloudflareContext();

  return fetchTagsByUserId(env.DB, userId, {
    order: "name",
  });
};

export async function generateMetadata({ params }: PageProps<"/user/[userId]/tag">): Promise<Metadata> {
  const { userId } = await params;

  const user = await cachedFetchUserById(userId);

  if (!user) {
    notFound();
  }

  return generateMetadataTitle({
    pageTitle: `すべてのタグ - ${user.name}`,
    noindex: true,
  });
}

export default async function TagListPage({ params }: PageProps<"/user/[userId]/tag">) {
  const { userId } = await params;

  const user = await cachedFetchUserById(userId);

  // ユーザーが存在しない場合は404
  if (!user) {
    notFound();
  }

  const fetchTagsResult = await cachedFetchAllTags(userId);

  const allTags = fetchTagsResult.success ? fetchTagsResult.data : [];

  return (
    <div className="col-span-full grid grid-cols-subgrid gap-y-12 py-16">
      <Header user={user} />

      <h1 className="col-start-2 text-4xl">すべてのタグ</h1>

      {allTags.length > 0 ? (
        <div className="col-start-2 mx-auto flex min-h-48 w-full flex-wrap gap-2">
          {allTags.map((tag) => (
            <TagLink key={tag.id} {...tag} />
          ))}
        </div>
      ) : (
        <Message message="からっぽです" />
      )}
    </div>
  );
}
