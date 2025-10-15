import { fetchImageById } from "@katasu.me/service-db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from "next/link";
import { notFound } from "next/navigation";
import { twMerge } from "tailwind-merge";
import IconFlag from "@/assets/icons/flag.svg";
import IconButton from "@/components/IconButton";
import Message from "@/components/Message";
import BigImage from "@/features/gallery/components/BigImage";
import { toFrameImageProps } from "@/features/gallery/lib/convert";
import { DEFAULT_IMAGE_TITLE } from "../../_constants/title";
import EditButton from "./EditButton";
import RemoveButton from "./RemoveButton";
import ShareButton from "./ShareButton";

type Props = {
  authorUserId: string;
  imageId: string;
  canEdit?: boolean;
};

export default async function ImagePageContent({ authorUserId, imageId, canEdit = false }: Props) {
  const { env } = getCloudflareContext();
  const fetchImage = await fetchImageById(env.DB, imageId);

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

      <div className="mt-4 flex items-center justify-center gap-2">
        {/* 通報 */}
        <IconButton>
          <IconFlag className="h-4 w-4" />
        </IconButton>

        {/* シェア */}
        <ShareButton title={image.title} userId={authorUserId} imageId={imageId} />
      </div>

      <div className="mt-7 flex flex-col items-center justify-center gap-6">
        {canEdit && (
          <div className="flex items-center gap-3">
            <EditButton imageId={image.id} title={image.title} tags={image.tags.map((tag) => tag.name)} />
            <RemoveButton userId={authorUserId} imageId={image.id} />
          </div>
        )}
      </div>
    </div>
  );
}
