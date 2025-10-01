import type { ImageWithTags } from "@katasu.me/service-db";
import type { ComponentProps } from "react";
import { getImageUrl } from "@/lib/r2";
import type FrameImage from "../components/FrameImage";

/**
 * ImageWithTagsをFrameImageのPropsに変換
 * @param imageWithTags ImageWithTags
 * @param authorUserId 画像登録者のユーザーID
 * @param variant 画像バリアント（デフォルト: thumbnail）
 * @returns FrameImageProps
 */
export function toFrameImageProps(
  imageWithTags: ImageWithTags,
  authorUserId: string,
  variant: "original" | "thumbnail" = "thumbnail",
): ComponentProps<typeof FrameImage> {
  const { id, width, height, title } = imageWithTags;

  return {
    id,
    src: getImageUrl(authorUserId, id, variant),
    alt: title || "", // TODO: altの中身を考える
    width,
    height,
    linkParams: {
      userId: authorUserId,
      imageId: id,
    },
  };
}
