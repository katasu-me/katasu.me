import {
  type FetchImagesOptions,
  fetchImagesByTagId,
  fetchTotalImageCountByTagId,
  type Tag,
} from "@katasu.me/service-db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { unstable_cache } from "next/cache";
import { notFound } from "next/navigation";
import Message from "@/components/Message";
import GalleryView from "@/features/gallery/components/GalleryView";
import { IMAGES_PER_PAGE } from "@/features/gallery/constants/images";
import { toFrameImageProps } from "@/features/gallery/lib/convert";
import type { ImageLayoutType } from "@/features/gallery/types/layout";
import { tagPageCacheTag } from "@/lib/cache-tags";

const cachedFetchTotalImageCount = async (userId: string, tagId: string) => {
  return unstable_cache(
    async (userId: string, tagId: string) => {
      const { env } = getCloudflareContext();
      return await fetchTotalImageCountByTagId(env.DB, tagId);
    },
    [`tag-image-count-${userId}-${tagId}`],
    {
      tags: [tagPageCacheTag(userId, tagId)],
    },
  )(userId, tagId);
};

const cachedFetchImages = async (userId: string, tagId: string, options: FetchImagesOptions) => {
  return unstable_cache(
    async (userId: string, tagId: string, options: FetchImagesOptions) => {
      const { env } = getCloudflareContext();
      return await fetchImagesByTagId(env.DB, tagId, options);
    },
    [`tag-images-${userId}-${tagId}-${options.offset ?? 0}-${options.order ?? "desc"}`],
    {
      tags: [tagPageCacheTag(userId, tagId)],
    },
  )(userId, tagId, options);
};

type Props = {
  tag: Tag;
  view: ImageLayoutType;
  currentPage?: number;
};

export default async function TagPageContents({ tag, view, currentPage = 1 }: Props) {
  // 投稿枚数を取得
  const fetchTotalImageCountResult = await cachedFetchTotalImageCount(tag.userId, tag.id);

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
  const fetchTagImagesResult = await cachedFetchImages(tag.userId, tag.id, {
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
