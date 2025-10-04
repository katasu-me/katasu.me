import {
  type ActionResult,
  type FetchImagesOptions,
  fetchImagesByUserId,
  fetchRandomImagesByUserId,
  fetchTotalImageCountByUserId,
  type ImageWithTags,
  type User,
} from "@katasu.me/service-db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { unstable_cacheLife as cacheLife, unstable_cacheTag as cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import Message from "@/components/Message";
import GalleryView from "@/features/gallery/components/GalleryView";
import { IMAGES_PER_PAGE } from "@/features/gallery/constants/images";
import { toFrameImageProps } from "@/features/gallery/lib/convert";
import type { ImageLayoutType } from "@/features/gallery/types/layout";
import { userPageCacheTag } from "@/lib/cache-tags";

const cachedFetchTotalImageCount = async (userId: string) => {
  "use cache";

  cacheTag(userPageCacheTag(userId));

  const { env } = getCloudflareContext();

  return fetchTotalImageCountByUserId(env.DB, userId);
};

const cachedFetchImages = async (userId: string, options: FetchImagesOptions) => {
  "use cache";

  cacheTag(userPageCacheTag(userId));

  const { env } = getCloudflareContext();

  return fetchImagesByUserId(env.DB, userId, options);
};

const cachedFetchRandomImages = async (userId: string) => {
  "use cache";

  cacheLife("seconds");

  const { env } = getCloudflareContext();

  return fetchRandomImagesByUserId(env.DB, userId);
};

type Props = {
  user: User;
  view: ImageLayoutType;
  currentPage?: number;
};

export default async function UserPageContents({ user, view, currentPage = 1 }: Props) {
  // 総画像枚数を取得
  const fetchTotalImageCountResult = await cachedFetchTotalImageCount(user.id);

  if (!fetchTotalImageCountResult.success) {
    console.error("Failed to fetch total image count:", fetchTotalImageCountResult.error);
    return <Message message="画像の取得に失敗しました" icon="error" />;
  }

  // 0枚ならからっぽ
  const totalImageCount = fetchTotalImageCountResult.data;
  if (totalImageCount <= 0) {
    return <Message message="からっぽです" />;
  }

  let fetchUserImagesResult: ActionResult<ImageWithTags[]>;

  switch (view) {
    case "masonry": {
      const offset = IMAGES_PER_PAGE * (currentPage - 1);

      // offsetが総画像枚数を超えていたら404
      if (totalImageCount < offset) {
        notFound();
      }

      // 画像を取得
      fetchUserImagesResult = await cachedFetchImages(user.id, {
        offset,
        order: "desc",
      });

      break;
    }

    case "random": {
      fetchUserImagesResult = await cachedFetchRandomImages(user.id);
      break;
    }
  }

  if (!fetchUserImagesResult.success) {
    console.error("Failed to fetch images:", fetchUserImagesResult.error);
    return <Message message="画像の取得に失敗しました" icon="error" />;
  }

  const images = fetchUserImagesResult.data.map((image) => toFrameImageProps(image, user.id));

  return <GalleryView view={view} images={images} totalImageCount={totalImageCount} currentPage={currentPage} />;
}
