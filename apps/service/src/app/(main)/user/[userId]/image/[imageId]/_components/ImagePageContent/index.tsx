import { fetchImageById } from "@katasu.me/service-db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { unstable_cacheTag as cacheTag } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { twMerge } from "tailwind-merge";
import IconFlag from "@/assets/icons/flag.svg";
import IconPencil from "@/assets/icons/pencil.svg";
import IconShare from "@/assets/icons/share.svg";
import Button from "@/components/Button";
import IconButton from "@/components/IconButton";
import Message from "@/components/Message";
import BigImage from "@/features/gallery/components/BigImage";
import { toFrameImageProps } from "@/features/gallery/lib/convert";
import { imagePageCacheTag, userPageCacheTag } from "@/lib/cache-tags";

const DEFAULT_IMAGE_TITLE = "タイトルなし";

const cachedFetchImage = async (userId: string, imageId: string) => {
  "use cache";

  cacheTag(userPageCacheTag(userId), imagePageCacheTag(userId, imageId));

  const { env } = getCloudflareContext();

  return fetchImageById(env.DB, imageId);
};

type Props = {
  userId: string;
  imageId: string;
};

export default async function ImagePageContent({ userId, imageId }: Props) {
  const fetchImage = await cachedFetchImage(userId, imageId);

  if (!fetchImage.success) {
    return <Message message="画像が取得できませんでした" />;
  }

  const image = fetchImage.data;

  if (!image) {
    notFound();
  }

  return (
    <div className="col-start-2 mx-auto w-full text-center">
      <BigImage {...toFrameImageProps(image, image.userId, "original")} />

      <h2 className={twMerge("mt-8 text-xl", !image.title && "text-warm-black-50")}>
        {image.title ?? DEFAULT_IMAGE_TITLE}
      </h2>

      {image.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {image.tags.map((tag) => (
            <Link
              key={tag.name}
              href={`/user/${userId}/tag/${tag.id}`}
              className="text-sm text-warm-black hover:underline"
            >
              #{tag.name}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-12 flex items-center justify-center">
        {/* TODO: 編集ボタンは投稿したユーザーのみ表示 */}
        <Button className="flex items-center gap-1">
          <IconPencil className="h-4 w-4" />
          <span className="text-sm">編集する</span>
        </Button>
        <IconButton className="ml-6">
          <IconFlag className="h-4 w-4" />
        </IconButton>
        <IconButton className="ml-3">
          <IconShare className="h-4 w-4" />
        </IconButton>
      </div>
    </div>
  );
}
