import Image from "next/image";
import Link from "next/link";
import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

type FrameImageProps = {
  width: number;
  height: number;
  href?: string;
  hasBlur?: boolean;
  disableHoverEffect?: boolean;
} & Omit<ComponentProps<typeof Image>, "width" | "height">;

export default function FrameImage({
  className,
  width,
  height,
  href,
  hasBlur = false,
  disableHoverEffect = false,
  ...props
}: FrameImageProps) {
  return (
    <div
      className={twMerge(
        "group relative overflow-hidden border-5 border-white bg-warm-black-25 shadow-md transition-transform duration-400 ease-magnetic",
        !disableHoverEffect && "hover:scale-[101%] active:scale-[99%]",
        className,
      )}
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      {href && (
        <Link className="focus:outline-none" href={href}>
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
