import { fetchTagsByUserId } from "@katasu.me/service-db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import TagLinks from "@/components/TagLinks";

type Props = {
  userId: string;
  className?: string;
};

export default async function UserTagLinks({ userId, className }: Props) {
  const { env } = getCloudflareContext();
  const fetchTagsResult = await fetchTagsByUserId(env.DB, userId);

  if (!fetchTagsResult.success) {
    return null;
  }

  const tags = fetchTagsResult.data;

  if (tags.length === 0) {
    return null;
  }

  return <TagLinks className={className} tags={tags} userId={userId} />;
}
