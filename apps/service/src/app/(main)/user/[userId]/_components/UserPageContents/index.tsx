import {
  fetchImagesByUserId,
  fetchTotalImageCountByUserId,
  type GetImagesByUserIdOptions,
  type User,
} from "@katasu.me/service-db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { unstable_cacheTag as cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import Message from "@/components/Message";
import GalleryView from "@/features/gallery/components/GalleryView";
import { IMAGES_PER_PAGE } from "@/features/gallery/constants/images";
import { toFrameImageProps } from "@/features/gallery/lib/convert";
import type { ImageLayoutType } from "@/features/gallery/types/layout";

const cachedFetchTotalImageCountByUserId = async (userId: string) => {
  "use cache";

  cacheTag(`user/${userId}`);

  const { env } = getCloudflareContext();

  return fetchTotalImageCountByUserId(env.DB, userId);
};

const cachedFetchImagesByUserId = async (userId: string, options: GetImagesByUserIdOptions) => {
  "use cache";

  cacheTag(`user/${userId}`);

  const { env } = getCloudflareContext();

  return fetchImagesByUserId(env.DB, userId, options);
};

type Props = {
  user: User;
  view: ImageLayoutType;
  currentPage?: number;
};

export default async function UserPageContents({ user, view, currentPage = 1 }: Props) {
  // 総画像枚数を取得
  const fetchTotalImageCountResult = await cachedFetchTotalImageCountByUserId(user.id);

  if (!fetchTotalImageCountResult.success) {
    console.error("Failed to fetch total image count:", fetchTotalImageCountResult.error);
    return <Message message="画像の取得に失敗しました" icon="error" />;
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
  const fetchUserImagesResult = await cachedFetchImagesByUserId(user.id, {
    offset,
    order: "desc",
  });

  if (!fetchUserImagesResult.success) {
    console.error("Failed to fetch images:", fetchUserImagesResult.error);
    return <Message message="画像の取得に失敗しました" icon="error" />;
  }

  const images = fetchUserImagesResult.data.map((image) => toFrameImageProps(image, user.id));

  return <GalleryView view={view} images={images} totalImageCount={totalImageCount} currentPage={currentPage} />;
}
