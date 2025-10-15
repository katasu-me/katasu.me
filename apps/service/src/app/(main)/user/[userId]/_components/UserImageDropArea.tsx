import { fetchTotalImageCountByUserId } from "@katasu.me/service-db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import ImageDropArea from "@/features/gallery/components/ImageDropArea";
import { getUserSession } from "@/lib/auth";

type Props = {
  userId: string;
  maxPhotos: number;
};

export default async function UserImageDropArea({ userId, maxPhotos }: Props) {
  const { env } = getCloudflareContext();

  const [{ session }, totalImageCountResult] = await Promise.all([
    getUserSession(env.DB),
    fetchTotalImageCountByUserId(env.DB, userId),
  ]);

  const totalImageCount = totalImageCountResult.success ? totalImageCountResult.data : 0;

  // オーナーでない場合は何も表示しない
  const isOwner = userId === session?.user?.id;

  if (!isOwner) {
    return null;
  }

  return (
    <div className="col-start-2">
      <ImageDropArea
        title="あたらしい画像を投稿する"
        counter={{
          total: totalImageCount,
          max: maxPhotos,
        }}
      />
    </div>
  );
}
