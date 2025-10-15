import { fetchTagsByUserId } from "@katasu.me/service-db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { unstable_cache } from "next/cache";
import TagLinks from "@/components/Navigation/TagLinks";
import { tagListCacheTag } from "@/lib/cache-tags";

/**
 * 使用頻度の高いタグを取得
 * @params userId ユーザーID
 * @returns タグ一覧
 */
const cachedFetchTags = async (userId: string) => {
  return unstable_cache(
    async (userId: string) => {
      const { env } = getCloudflareContext();

      const result = await fetchTagsByUserId(env.DB, userId, {
        limit: 4,
        order: "usage",
      });

      if (!result.success) {
        return [];
      }

      return result.data;
    },
    [`top-tags-${userId}`],
    {
      tags: [tagListCacheTag(userId)],
    },
  )(userId);
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
