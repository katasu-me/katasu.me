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
      className={twMerge("relative w-full overflow-hidden border-4 border-white bg-warm-black-25 shadow-md", className)}
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      {props.title && (
        <div className="absolute right-[-1px] bottom-[-1px] z-[1] w-fit rounded-tl-xl bg-white px-2 py-1 text-xs">
          {props.title}
        </div>
      )}
      <Image className="object-cover" fill {...props} />
    </div>
  );
}
