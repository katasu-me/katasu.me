import {
  type ActionResult,
  fetchImagesByUserId,
  fetchRandomImagesByUserId,
  fetchTotalImageCountByUserId,
  type ImageWithTags,
  type PublicUserData,
} from "@katasu.me/service-db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { notFound } from "next/navigation";
import Message from "@/components/Message";
import GalleryView from "@/features/gallery/components/GalleryView";
import { IMAGES_PER_PAGE } from "@/features/gallery/constants/images";
import { toFrameImageProps } from "@/features/gallery/lib/convert";
import type { ImageLayoutType } from "@/features/gallery/types/layout";

type Props = {
  user: PublicUserData;
  view: ImageLayoutType;
  currentPage?: number;
};

export default async function UserPageContents({ user, view, currentPage = 1 }: Props) {
  const { env } = getCloudflareContext();

  // 総画像数を取得
  const totalImageCountResult = await fetchTotalImageCountByUserId(env.DB, user.id);

  if (!totalImageCountResult.success) {
    console.error("[page] 画像数の取得に失敗しました:", totalImageCountResult.error);
    return <Message message="画像数の取得に失敗しました" icon="error" />;
  }

  const totalImageCount = totalImageCountResult.data;

  // 0枚ならからっぽ
  if (totalImageCount <= 0) {
    return <Message message="からっぽです" />;
  }

  let fetchUserImagesResult: ActionResult<ImageWithTags[]>;

  switch (view) {
    case "timeline": {
      const offset = IMAGES_PER_PAGE * (currentPage - 1);

      // offsetが総画像枚数を超えていたら404
      if (totalImageCount < offset) {
        notFound();
      }

      // 画像を取得
      fetchUserImagesResult = await fetchImagesByUserId(env.DB, user.id, {
        offset,
        order: "desc",
      });

      break;
    }

    case "random": {
      fetchUserImagesResult = await fetchRandomImagesByUserId(env.DB, user.id);
      break;
    }
  }

  if (!fetchUserImagesResult.success) {
    console.error("[page] 画像の取得に失敗しました:", fetchUserImagesResult.error);
    return <Message message="画像の取得に失敗しました" icon="error" />;
  }

  const images = fetchUserImagesResult.data.map((image) => toFrameImageProps(image, user.id));

  return <GalleryView view={view} images={images} totalImageCount={totalImageCount} currentPage={currentPage} />;
}
