import { fetchTagsByUserId } from "@katasu.me/service-db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Metadata } from "next";
import { unstable_cacheTag as cacheTag, revalidateTag } from "next/cache";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Message from "@/components/Message";
import TagLink from "@/components/Navigation/TagLinks/TabLink";
import { SITE_DESCRIPTION_LONG } from "@/constants/site";
import { tagListCacheTag } from "@/lib/cache-tags";
import { getUserAvatarUrl } from "@/lib/image";
import { generateMetadataTitle } from "@/lib/meta";
import { cachedFetchPublicUserDataById } from "@/lib/user";

const cachedFetchAllTags = async (userId: string) => {
  "use cache";

  const tag = tagListCacheTag(userId);
  cacheTag(tag);

  const { env } = getCloudflareContext();

  const result = await fetchTagsByUserId(env.DB, userId, {
    order: "name",
  });

  if (!result.success) {
    revalidateTag(tag);
    return [];
  }

  return result.data;
};

export async function generateMetadata({ params }: PageProps<"/user/[userId]/tag">): Promise<Metadata> {
  const { userId } = await params;

  const userResult = await cachedFetchPublicUserDataById(userId);

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
    pageTitle: `すべてのタグ - ${user.name}`,
    description: SITE_DESCRIPTION_LONG,
    imageUrl: avatarUrl,
    twitterCard: "summary",
    path: `/user/${userId}/tag`,
    noindex: true,
  });
}

export default async function TagListPage({ params }: PageProps<"/user/[userId]/tag">) {
  const { userId } = await params;

  const userResult = await cachedFetchPublicUserDataById(userId);

  // 存在しない、または新規登録が完了していない場合は404
  if (
    !userResult.success ||
    !userResult.data ||
    !userResult.data.termsAgreedAt ||
    !userResult.data.privacyPolicyAgreedAt
  ) {
    notFound();
  }

  const allTags = await cachedFetchAllTags(userId);
  const user = userResult.data;

  return (
    <div className="col-span-full grid grid-cols-subgrid gap-y-12 py-16">
      <Header user={user} />

      <h1 className="col-start-2 text-4xl">すべてのタグ</h1>

      {allTags.length > 0 ? (
        <div className="col-start-2 mx-auto flex min-h-48 w-full flex-wrap content-start items-start gap-2">
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
