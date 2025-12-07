import type { ImageStatus } from "@katasu.me/service-db";
import { Link } from "@tanstack/react-router";
import { type ComponentProps, useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";
import IconAlertTriangleFilled from "@/assets/icons/alert-triangle-filled.svg?react";
import IconExclamationCircle from "@/assets/icons/exclamation-circle.svg?react";
import IconLoader2 from "@/assets/icons/loader-2.svg?react";
import { decodeThumbHash, getThumbHashLuminance } from "@/libs/thumbhash";
import StatusOverlay from "./StatusOverlay";

type FrameImageProps = {
  width: number;
  height: number;
  linkParams?: {
    userId: string;
    imageId: string;
  };
  disableHoverEffect?: boolean;
  status?: ImageStatus;
  thumbhash?: string | null;
} & Omit<ComponentProps<"img">, "width" | "height">;

export default function FrameImage({
  className,
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

  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // ThumbHashからブラー画像と明るさを取得
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
      return <StatusOverlay icon={<StatusIcon className="size-8 text-warm-black-50" />} />;
    }

    if (isProcessing) {
      return (
        <div className="pointer-events-none absolute top-0 left-0 flex h-full w-full flex-col items-center justify-center gap-1 p-4">
          <IconLoader2 className={twMerge("size-6 animate-spin", isDark ? "text-warm-white" : "text-warm-black-50")} />
          <span className={twMerge("text-center font-bold text-xs", isDark ? "text-warm-white" : "text-warm-black-50")}>
            いい感じにしています
          </span>
        </div>
      );
    }

    return (
      <img
        className={twMerge(
          "pointer-events-none absolute top-0 left-0 h-full w-full object-cover transition-opacity duration-400 ease-magnetic",
          !disableHoverEffect && "group-hover:brightness-90",
          !isImageLoaded && "opacity-0",
        )}
        alt={alt}
        onLoad={() => setIsImageLoaded(true)}
        {...props}
      />
    );
  };

  return (
    <div
      className={twMerge(
        "group intaraction-base relative overflow-hidden border-5 border-white bg-center bg-cover bg-warm-black-25 shadow-md",
        !disableHoverEffect && "interactive-scale-sm",
        className,
      )}
      style={{
        aspectRatio: `${width} / ${height}`,
        backgroundImage: blurDataUrl ? `url(${blurDataUrl})` : undefined,
      }}
    >
      {linkParams && (
        <Link
          className="focus:outline-none"
          to="/user/$userId/image/$imageId"
          params={{
            userId: linkParams.userId,
            imageId: linkParams.imageId,
          }}
        >
          {alt}
          <span className="absolute inset-0 z-overlay" />
        </Link>
      )}
      {renderContent()}
    </div>
  );
}
