import ImageDropArea from "@/features/gallery/components/ImageDropArea";
import { cachedFetchTotalImageCount } from "../_lib/fetch-total-image-count";

type Props = {
  userId: string;
  maxPhotos: number;
};

export default async function UserImageDropArea({ userId, maxPhotos }: Props) {
  const totalImageCountResult = await cachedFetchTotalImageCount(userId);
  const totalImageCount = totalImageCountResult.success ? totalImageCountResult.data : 0;

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
