import { fetchImagesByTagId, fetchTotalImageCountByTagId, type Tag } from "@katasu.me/service-db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { notFound } from "next/navigation";
import Message from "@/components/Message";
import GalleryView from "../../../../_components/GalleryView";
import { IMAGES_PER_PAGE } from "../../../../_constants/images";
import { toFrameImageProps } from "../../../../_lib/convert";
import type { ImageLayoutType } from "../../../../_types/layout";

type Props = {
  tag: Tag;
  view: ImageLayoutType;
  currentPage?: number;
};

export default async function TagPageContents({ tag, view, currentPage = 1 }: Props) {
  const { env } = getCloudflareContext();

  // 投稿枚数を取得
  const fetchTotalImageCountResult = await fetchTotalImageCountByTagId(env.DB, tag.id);

  if (!fetchTotalImageCountResult.success) {
    console.error("[page] 投稿枚数の取得に失敗しました:", fetchTotalImageCountResult.error);
    return <Message message="投稿枚数の取得に失敗しました" icon="error" />;
  }

  // 0枚ならからっぽ
  const totalImageCount = fetchTotalImageCountResult.data;
  if (totalImageCount <= 0) {
    return <Message message="からっぽです" />;
  }

  const offset = IMAGES_PER_PAGE * (currentPage - 1);

  // offsetが総画像枚数を超えていたら404
  if (totalImageCount < offset) {
    notFound();
  }

  // 画像を取得
  const fetchTagImagesResult = await fetchImagesByTagId(env.DB, tag.id, {
    offset,
    order: "desc",
  });

  if (!fetchTagImagesResult.success) {
    console.error("[page] 画像の取得に失敗しました:", fetchTagImagesResult.error);
    return <Message message="画像の取得に失敗しました" icon="error" />;
  }

  const images = fetchTagImagesResult.data.map((image) => toFrameImageProps(image, tag.userId));

  return (
    <GalleryView
      view={view}
      images={images}
      totalImageCount={totalImageCount}
      currentPage={currentPage}
      defaultTags={[tag.name]}
    />
  );
}
