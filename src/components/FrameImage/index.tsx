import Image from "next/image";
import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

interface FrameImageProps extends Omit<ComponentProps<typeof Image>, "width" | "height"> {
  width: number;
  height: number;
}

export default function FrameImage({ className, width, height, ...props }: FrameImageProps) {
  return (
    <div
      className={twMerge("relative w-full overflow-hidden border-5 border-white bg-warm-black-25 shadow-md", className)}
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      <Image className="object-cover" fill {...props} />
    </div>
  );
}
