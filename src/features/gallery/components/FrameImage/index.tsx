import Image from "next/image";
import Link from "next/link";
import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

type FrameImageProps = {
  width: number;
  height: number;
  linkHref?: string;
  hasBlur?: boolean;
  hasHoverEffect?: boolean;
} & Omit<ComponentProps<typeof Image>, "width" | "height">;

export default function FrameImage({
  className,
  width,
  height,
  linkHref,
  hasBlur = false,
  hasHoverEffect = true,
  ...props
}: FrameImageProps) {
  return (
    <div
      className={twMerge(
        "group relative overflow-hidden border-5 border-white bg-warm-black-25 shadow-md transition-transform duration-400 ease-magnetic",
        hasHoverEffect && "hover:scale-[101%] active:scale-[99%]",
        className,
      )}
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      {linkHref && (
        <Link className="focus:outline-none" href={linkHref}>
          {props.alt}
          <span className="absolute inset-0 z-1" />
        </Link>
      )}
      <Image
        className={twMerge(
          "pointer-events-none object-cover transition-all",
          hasHoverEffect && "group-hover:brightness-90",
          hasBlur && "blur-sm",
        )}
        fill
        {...props}
      />
    </div>
  );
}
