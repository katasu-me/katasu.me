import type { ImageWithTags } from "@katasu.me/service-db";
import type { ComponentProps } from "react";
import type FrameImage from "@/components/FrameImage";
import { getImageUrl } from "@/libs/r2";

export function toFrameImageProps(
  imageWithTags: ImageWithTags,
  variant: "original" | "thumbnail" = "thumbnail",
  userSlug?: string,
): ComponentProps<typeof FrameImage> {
  const { id, userId, width, height, title, status, thumbhash } = imageWithTags;

  return {
    id,
    src: getImageUrl(userId, id, variant),
    alt: title || "",
    width,
    height,
    status,
    thumbhash,
    linkParams: {
      userSlug: userSlug || userId,
      imageId: id,
    },
  };
}
