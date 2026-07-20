import type { ImageWithTags } from "@katasu.me/service-db";
import { Link } from "@tanstack/react-router";
import { css, cx } from "styled-system/css";
import IconFlag from "@/assets/icons/flag.svg?react";
import BudouX from "@/components/BudouX";
import IconButton from "@/components/IconButton";
import { DEFAULT_IMAGE_TITLE } from "@/features/gallery/constants/page";
import { toFrameImageProps } from "@/features/gallery/libs/convert";
import { ERROR_MESSAGE } from "@/features/image-view/constants/message";
import BigImage from "../BigImage";
import ShareButton from "../ShareButton";

type Props = {
  image: ImageWithTags;
  userSlug: string;
  sessionUserId?: string;
};

export default function ImageDetail({ image, userSlug, sessionUserId }: Props) {
  const canEdit = sessionUserId === image.userId;
  const isViolation = image.status === "moderation_violation";
  const isError = image.status === "error";
  const frameImageProps = toFrameImageProps(image, "original", userSlug);

  const renderContent = () => {
    const errorMessage = isViolation ? ERROR_MESSAGE.VIOLATION : isError ? ERROR_MESSAGE.PROCESSING_FAILED : null;

    if (errorMessage) {
      return (
        <div className={css({ mt: "8" })}>
          <p className={css({ mt: "2", color: "warm-black-50", fontSize: "sm", lineHeight: "5" })}>
            <BudouX>{errorMessage}</BudouX>
          </p>
        </div>
      );
    }

    return (
      <>
        <h2
          className={cx(
            css({
              mt: "8",
              fontSize: "xl",
              lineHeight: "7",
            }),
            !image.title && css({ color: "warm-black-50" }),
          )}
        >
          {image.title || DEFAULT_IMAGE_TITLE}
        </h2>

        {image.tags.length > 0 && (
          <div className={css({ mt: "4", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "2" })}>
            {image.tags.map((tag) => (
              <Link
                key={tag.name}
                className={css({
                  color: "warm-black",
                  fontSize: "sm",
                  lineHeight: "5",
                  _hover: {
                    textDecoration: "underline",
                  },
                })}
                to="/user/$userSlug/tag/$tagId"
                params={{ userSlug, tagId: tag.id }}
                search={{ view: "timeline", page: 1 }}
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}

        <div className={css({ mt: "4", display: "flex", alignItems: "center", justifyContent: "center", gap: "2" })}>
          {!canEdit && (
            <IconButton asChild>
              <Link
                to="/report/image"
                search={{
                  imageId: image.id,
                  reporterUserId: sessionUserId,
                }}
                target="_blank"
                rel="noopener"
                aria-label="この画像を報告"
              >
                <IconFlag className={css({ w: "4", h: "4" })} />
              </Link>
            </IconButton>
          )}

          <ShareButton title={image.title} userSlug={userSlug} imageId={image.id} />
        </div>
      </>
    );
  };

  return (
    <div className={css({ mx: "auto", w: "full", textAlign: "center" })}>
      <BigImage {...frameImageProps} />
      {renderContent()}
    </div>
  );
}
