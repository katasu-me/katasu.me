import type { ImageStatus } from "@katasu.me/service-db";
import { Link } from "@tanstack/react-router";
import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";
import IconAlertTriangleFilled from "@/assets/icons/alert-triangle-filled.svg?react";

type FrameImageProps = {
  width: number;
  height: number;
  linkParams?: {
    userId: string;
    imageId: string;
  };
  disableHoverEffect?: boolean;
  status?: ImageStatus;
} & Omit<ComponentProps<"img">, "width" | "height">;

export default function FrameImage({
  className,
  width,
  height,
  linkParams,
  disableHoverEffect = false,
  status = "published",
  alt,
  ...props
}: FrameImageProps) {
  const isViolation = status === "moderation_violation";

  return (
    <div
      className={twMerge(
        "group intaraction-base relative overflow-hidden border-5 border-white bg-warm-black-25 shadow-md",
        !disableHoverEffect && "interactive-scale-sm",
        className,
      )}
      style={{ aspectRatio: `${width} / ${height}` }}
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
      {isViolation ? (
        <div className="pointer-events-none absolute top-0 left-0 flex h-full w-full flex-col items-center justify-center gap-1 bg-warm-black-100 p-4">
          <IconAlertTriangleFilled className="size-8 text-warm-black-50" />
          <span className="text-center text-warm-black-50 text-xs">ガイドライン違反</span>
        </div>
      ) : (
        <img
          className={twMerge(
            "pointer-events-none absolute top-0 left-0 h-full w-full object-cover transition-all",
            !disableHoverEffect && "group-hover:brightness-90",
          )}
          alt={alt}
          {...props}
        />
      )}
    </div>
  );
}
