import { fetchTagsByUserId } from "@katasu.me/service-db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import TagLinks from "@/components/TagLinks";
import { CACHE_KEYS, getCached } from "@/lib/cache";

type Props = {
  userId: string;
  className?: string;
};

const cachedFetchTagsByUsage = async (userId: string) => {
  const { env } = getCloudflareContext();

  return getCached(env.CACHE_KV, CACHE_KEYS.userTagsByUsage(userId), async () => {
    return fetchTagsByUserId(env.DB, userId, {
      order: "usage",
    });
  });
};

export default async function UserTagLinks({ userId, className }: Props) {
  const fetchTagsResult = await cachedFetchTagsByUsage(userId);

  if (!fetchTagsResult.success) {
    return null;
  }

  const tags = fetchTagsResult.data;

  if (tags.length === 0) {
    return null;
  }

  return <TagLinks className={className} tags={tags} userId={userId} />;
}
