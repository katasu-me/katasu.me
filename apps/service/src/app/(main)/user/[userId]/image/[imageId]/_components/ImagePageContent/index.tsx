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
import { DEFAULT_IMAGE_TITLE } from "../../_constants/title";
import { cachedFetchImage } from "../../_lib/fetch";

type Props = {
  authorUserId: string;
  imageId: string;
  canEdit?: boolean;
};

export default async function ImagePageContent({ authorUserId, imageId, canEdit = false }: Props) {
  const fetchImage = await cachedFetchImage(authorUserId, imageId);

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
              href={`/user/${authorUserId}/tag/${tag.id}`}
              className="text-sm text-warm-black hover:underline"
            >
              #{tag.name}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-12 flex items-center justify-center gap-6">
        {/* 編集 */}
        {canEdit && (
          <Button className="flex items-center gap-1">
            <IconPencil className="h-4 w-4" />
            <span className="text-sm">編集する</span>
          </Button>
        )}

        <div className="flex items-center gap-3">
          {/* 通報 */}
          <IconButton>
            <IconFlag className="h-4 w-4" />
          </IconButton>

          {/* シェア */}
          <IconButton>
            <IconShare className="h-4 w-4" />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
