import Image from "next/image";
import Link from "next/link";
import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

type FrameImageProps = {
  width: number;
  height: number;
  linkParams?: {
    userId: string;
    imageId: string;
  };
  hasBlur?: boolean;
  disableHoverEffect?: boolean;
} & Omit<ComponentProps<typeof Image>, "width" | "height">;

export default function FrameImage({
  className,
  width,
  height,
  linkParams,
  hasBlur = false,
  disableHoverEffect = false,
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
        <Link className="focus:outline-none" href={`/user/${linkParams.userId}/image/${linkParams.imageId}`}>
          {props.alt}
          <span className="absolute inset-0 z-1" />
        </Link>
      )}
      <Image
        className={twMerge(
          "pointer-events-none object-cover transition-all",
          !disableHoverEffect && "group-hover:brightness-90",
          hasBlur && "blur-sm",
        )}
        fill
        {...props}
      />
    </div>
  );
}
