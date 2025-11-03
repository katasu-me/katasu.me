import { fetchImagesByUserId, type PublicUserData } from "@katasu.me/service-db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { notFound } from "next/navigation";
import Message from "@/components/Message";
import { IMAGES_PER_PAGE } from "../../_constants/images";
import { toFrameImageProps } from "../../_lib/convert";
import { cachedFetchTotalImageCount } from "../../_lib/fetch-total-image-count";
import type { ImageLayoutType } from "../../_types/layout";
import GalleryMasonry from "../GalleryMasonry";
import GalleryRandom from "../GalleryRandom";

type Props = {
  user: PublicUserData;
  view: ImageLayoutType;
  currentPage?: number;
};

export default async function UserPageContents({ user, view, currentPage = 1 }: Props) {
  const { env } = getCloudflareContext();

  // 総画像数を取得
  const totalImageCountResult = await cachedFetchTotalImageCount(user.id);

  if (!totalImageCountResult.success) {
    console.error("[page] 画像数の取得に失敗しました:", totalImageCountResult.error);
    return <Message message="画像数の取得に失敗しました" icon="error" />;
  }

  const totalImageCount = totalImageCountResult.data;

  // 0枚ならからっぽ
  if (totalImageCount <= 0) {
    return <Message message="からっぽです" />;
  }

  if (view === "random") {
    return (
      <GalleryRandom
        fetchRandomOptions={{
          type: "user",
          userId: user.id,
        }}
      />
    );
  }

  const offset = IMAGES_PER_PAGE * (currentPage - 1);

  // offsetが総画像枚数を超えていたら404
  if (totalImageCount < offset) {
    notFound();
  }

  // 画像を取得
  const fetchUserImagesResult = await fetchImagesByUserId(env.DB, user.id, {
    offset,
    order: "desc",
  });

  if (!fetchUserImagesResult.success) {
    console.error("[page] 画像の取得に失敗しました:", fetchUserImagesResult.error);
    return <Message message="画像の取得に失敗しました" icon="error" />;
  }

  const images = fetchUserImagesResult.data.map((image) => toFrameImageProps(image, user.id));

  return (
    <GalleryMasonry
      className="col-start-2"
      images={images}
      totalImageCount={totalImageCount}
      currentPage={currentPage}
    />
  );
}
