import type { ImageWithTags } from "@katasu.me/service-db";
import type { ComponentProps } from "react";
import type FrameImage from "@/components/FrameImage";
import { getImageUrl } from "@/libs/r2";

/**
 * ImageWithTagsをFrameImageのPropsに変換
 * @param imageWithTags ImageWithTags
 * @param authorUserId 画像登録者のユーザーID
 * @param variant 画像バリアント（デフォルト: thumbnail）
 * @returns FrameImageProps
 */
export function toFrameImageProps(
  imageWithTags: ImageWithTags,
  variant: "original" | "thumbnail" = "thumbnail",
): ComponentProps<typeof FrameImage> {
  const { id, userId, width, height, title, status, thumbhash } = imageWithTags;

  return {
    id,
    src: getImageUrl(userId, id, variant),
    alt: title || "", // TODO: altの中身を考える
    width,
    height,
    status,
    thumbhash,
    linkParams: {
      userId: userId,
      imageId: id,
    },
  };
}
