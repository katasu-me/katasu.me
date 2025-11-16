import { Link } from "@tanstack/react-router";
import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

type FrameImageProps = {
  width: number;
  height: number;
  linkParams?: {
    userId: string;
    imageId: string;
  };
  disableHoverEffect?: boolean;
} & Omit<ComponentProps<"img">, "width" | "height">;

export default function FrameImage({
  className,
  width,
  height,
  linkParams,
  disableHoverEffect = false,
  alt,
  ...props
}: FrameImageProps) {
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
          <span className="absolute inset-0 z-1" />
        </Link>
      )}
      <img
        className={twMerge(
          "pointer-events-none absolute top-0 left-0 h-full w-full object-cover transition-all",
          !disableHoverEffect && "group-hover:brightness-90",
        )}
        alt={alt}
        {...props}
      />
    </div>
  );
}
