import Image from "next/image";
import Link from "next/link";
import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

interface FrameImageProps extends Omit<ComponentProps<typeof Image>, "width" | "height"> {
  width: number;
  height: number;
  href?: string;
}

export default function FrameImage({ className, width, height, href, ...props }: FrameImageProps) {
  const frameClassname = twMerge(
    "relative w-full overflow-hidden border-5 border-white bg-warm-black-25 shadow-md",
    href && "hover:scale-[101%] active:scale-[99%] group transition-transform duration-400 ease-magnetic",
    className,
  );

  const frameStyle = {
    aspectRatio: `${width} / ${height}`,
  };

  return (
    <div className={frameClassname} style={frameStyle}>
      {href && (
        <Link className="focus:outline-none" href={href} target="_blank" rel="noopener">
          {props.alt}
          <span className="absolute inset-0 z-1" />
        </Link>
      )}
      <Image className="object-cover transition-all group-hover:brightness-90" fill {...props} />
    </div>
  );
}
