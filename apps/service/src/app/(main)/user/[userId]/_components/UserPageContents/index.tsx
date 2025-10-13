import {
  type ActionResult,
  type FetchImagesOptions,
  fetchImagesByUserId,
  fetchRandomImagesByUserId,
  type ImageWithTags,
  type User,
} from "@katasu.me/service-db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { unstable_cacheLife as cacheLife, unstable_cacheTag as cacheTag, revalidateTag } from "next/cache";
import { notFound } from "next/navigation";
import Message from "@/components/Message";
import GalleryView from "@/features/gallery/components/GalleryView";
import { IMAGES_PER_PAGE } from "@/features/gallery/constants/images";
import { toFrameImageProps } from "@/features/gallery/lib/convert";
import type { ImageLayoutType } from "@/features/gallery/types/layout";
import { userPageCacheTag } from "@/lib/cache-tags";

/**
 * ユーザーが投稿した画像を取得
 * @param userId ユーザーID
 * @param options 取得オプション
 * @return 画像一覧
 */
const cachedFetchImages = async (userId: string, options: FetchImagesOptions) => {
  "use cache";

  const tag = userPageCacheTag(userId);
  cacheTag(tag);

  const { env } = getCloudflareContext();

  const result = await fetchImagesByUserId(env.DB, userId, options);

  if (!result.success) {
    revalidateTag(tag);
  }

  return result;
};

/**
 * ユーザーが投稿した画像をランダムで取得
 * @param userId ユーザーID
 * @return 画像一覧
 */
const cachedFetchRandomImages = async (userId: string) => {
  "use cache";

  cacheLife("seconds");

  const { env } = getCloudflareContext();

  return fetchRandomImagesByUserId(env.DB, userId);
};

type Props = {
  user: User;
  view: ImageLayoutType;
  totalImageCount: number;
  currentPage?: number;
};

export default async function UserPageContents({ user, view, totalImageCount, currentPage = 1 }: Props) {
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
    console.error("[page] 画像の取得に失敗しました:", fetchUserImagesResult.error);
    return <Message message="画像の取得に失敗しました" icon="error" />;
  }

  const images = fetchUserImagesResult.data.map((image) => toFrameImageProps(image, user.id));

  return <GalleryView view={view} images={images} totalImageCount={totalImageCount} currentPage={currentPage} />;
}
