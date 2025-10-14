import { fetchTagsByUserId } from "@katasu.me/service-db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { unstable_cacheTag as cacheTag, revalidateTag } from "next/cache";
import TagLinks from "@/components/Navigation/TagLinks";
import { tagListCacheTag } from "@/lib/cache-tags";

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

type Props = {
  userId: string;
  className?: string;
};

export default async function UserTagLinks({ userId, className }: Props) {
  const tags = await cachedFetchTags(userId);

  if (tags.length === 0) {
    return null;
  }

  return <TagLinks className={className} tags={tags} userId={userId} />;
}
