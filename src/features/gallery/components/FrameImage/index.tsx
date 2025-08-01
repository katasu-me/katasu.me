import Image from "next/image";
import Link from "next/link";
import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

type FrameImageProps = {
  width: number;
  height: number;
  href?: string;
  isBlurred?: boolean;
} & Omit<ComponentProps<typeof Image>, "width" | "height">;

export default function FrameImage({ className, width, height, href, isBlurred = false, ...props }: FrameImageProps) {
  return (
    <div
      className={twMerge(
        "group relative overflow-hidden border-5 border-white bg-warm-black-25 shadow-md transition-transform duration-400 ease-magnetic hover:scale-[101%] active:scale-[99%]",
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
          "pointer-events-none object-cover transition-all group-hover:brightness-90",
          isBlurred && "blur-sm",
        )}
        fill
        {...props}
      />
    </div>
  );
}
