import type { ImageStatus } from "@katasu.me/service-db";
import { Link } from "@tanstack/react-router";
import { type ComponentProps, useMemo } from "react";
import { css, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";
import IconAlertTriangleFilled from "@/assets/icons/alert-triangle-filled.svg?react";
import IconExclamationCircle from "@/assets/icons/exclamation-circle.svg?react";
import LoaderIcon from "@/components/Icon/LucideAnimated/LoaderIcon";
import { decodeThumbHash, getThumbHashLuminance } from "@/libs/thumbhash";
import StatusOverlay from "./StatusOverlay";

type FrameImageProps = {
  width: number;
  height: number;
  linkParams?: {
    userSlug: string;
    imageId: string;
  };
  disableHoverEffect?: boolean;
  status?: ImageStatus;
  thumbhash?: string | null;
  cssProps?: SystemStyleObject;
} & Omit<ComponentProps<"img">, "width" | "height" | "className">;

export default function FrameImage({
  cssProps,
  width,
  height,
  linkParams,
  disableHoverEffect = false,
  status = "published",
  thumbhash,
  alt,
  ...props
}: FrameImageProps) {
  const isViolation = status === "moderation_violation";
  const isProcessing = status === "processing";
  const isError = status === "error";

  const { blurDataUrl, isDark } = useMemo(() => {
    if (!thumbhash) {
      return {
        blurDataUrl: null,
        isDark: false,
      };
    }

    const luminance = getThumbHashLuminance(thumbhash);

    return {
      blurDataUrl: decodeThumbHash(thumbhash),
      isDark: luminance < 0.7,
    };
  }, [thumbhash]);

  const renderContent = () => {
    const StatusIcon = isViolation ? IconAlertTriangleFilled : isError ? IconExclamationCircle : null;

    if (StatusIcon) {
      return <StatusOverlay icon={<StatusIcon className={css({ w: "8", h: "8", color: "warm-black-50" })} />} />;
    }

    if (isProcessing) {
      return (
        <div
          className={css({
            pointerEvents: "none",
            position: "absolute",
            top: "0",
            left: "0",
            display: "flex",
            w: "full",
            h: "full",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1",
            p: "4",
          })}
        >
          <LoaderIcon cssProps={css.raw({ w: "6", h: "6", color: isDark ? "warm-white" : "warm-black" })} size={24} />
        </div>
      );
    }

    return (
      <img
        className={css({
          pointerEvents: "none",
          position: "absolute",
          top: "0",
          left: "0",
          w: "full",
          h: "full",
          objectFit: "cover",
          transition: "opacity 400ms token(easings.magnetic)",
          _groupHover: !disableHoverEffect ? { filter: "brightness(0.9)" } : undefined,
        })}
        alt={alt}
        {...props}
      />
    );
  };

  return (
    <div
      className={cx(
        "group",
        "interactive-base",
        !disableHoverEffect && "interactive-scale-sm",
        css(
          {
            position: "relative",
            overflow: "hidden",
            borderWidth: "5px",
            borderColor: "white",
            bgColor: "warm-black-25",
            bgPosition: "center",
            bgSize: "cover",
            shadow: "md",
          },
          cssProps,
        ),
      )}
      style={{
        aspectRatio: `${width} / ${height}`,
        backgroundImage: blurDataUrl ? `url(${blurDataUrl})` : undefined,
      }}
    >
      {linkParams && (
        <Link
          className={css({ _focus: { outline: "none" } })}
          to="."
          search={(prev) => ({
            ...prev,
            image: linkParams.imageId,
          })}
          mask={{
            to: "/user/$userSlug/image/$imageId",
            params: {
              userSlug: linkParams.userSlug,
              imageId: linkParams.imageId,
            },
            unmaskOnReload: true,
          }}
          resetScroll={false}
          aria-label={alt}
        >
          <span className={css({ srOnly: true })}>{alt}</span>
          <span className={css({ position: "absolute", inset: "0", zIndex: "overlay" })} />
        </Link>
      )}
      {renderContent()}
    </div>
  );
}
