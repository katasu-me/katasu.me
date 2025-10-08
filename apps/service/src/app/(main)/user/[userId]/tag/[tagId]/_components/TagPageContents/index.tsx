import {
  type FetchImagesOptions,
  fetchImagesByTagId,
  fetchTotalImageCountByTagId,
  type Tag,
} from "@katasu.me/service-db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { unstable_cacheTag as cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import Message from "@/components/Message";
import GalleryView from "@/features/gallery/components/GalleryView";
import ImageDropArea from "@/features/gallery/components/ImageDropArea";
import { IMAGES_PER_PAGE } from "@/features/gallery/constants/images";
import { toFrameImageProps } from "@/features/gallery/lib/convert";
import type { ImageLayoutType } from "@/features/gallery/types/layout";
import { tagPageCacheTag } from "@/lib/cache-tags";

const cachedFetchTotalImageCount = async (userId: string, tagId: string) => {
  "use cache";

  cacheTag(tagPageCacheTag(userId, tagId));

  const { env } = getCloudflareContext();

  return fetchTotalImageCountByTagId(env.DB, tagId);
};

const cachedFetchImages = async (userId: string, tagId: string, options: FetchImagesOptions) => {
  "use cache";

  cacheTag(tagPageCacheTag(userId, tagId));

  const { env } = getCloudflareContext();

  return fetchImagesByTagId(env.DB, tagId, options);
};

type Props = {
  tag: Tag;
  view: ImageLayoutType;
  currentPage?: number;
};

export default async function TagPageContents({ tag, view, currentPage = 1 }: Props) {
  // 総画像枚数を取得
  const fetchTotalImageCountResult = await cachedFetchTotalImageCount(tag.userId, tag.id);

  if (!fetchTotalImageCountResult.success) {
    console.error("Failed to fetch total image count:", fetchTotalImageCountResult.error);
    return <Message message="画像の取得に失敗しました" icon="error" />;
  }

  // 0枚ならからっぽ
  const totalImageCount = fetchTotalImageCountResult.data;
  if (totalImageCount <= 0) {
    return (
      <>
        <div className="col-start-2">
          <ImageDropArea title="あたらしい画像を投稿する" defaultTags={[tag.name]} />
        </div>
        <Message message="からっぽです" />
      </>
    );
  }

  const offset = IMAGES_PER_PAGE * (currentPage - 1);

  // offsetが総画像枚数を超えていたら404
  if (totalImageCount < offset) {
    notFound();
  }

  // 画像を取得
  const fetchTagImagesResult = await cachedFetchImages(tag.userId, tag.id, {
    offset,
    order: "desc",
  });

  if (!fetchTagImagesResult.success) {
    console.error("Failed to fetch images:", fetchTagImagesResult.error);
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
