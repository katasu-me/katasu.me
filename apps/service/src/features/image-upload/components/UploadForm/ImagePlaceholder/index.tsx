import type { ComponentPropsWithoutRef } from "react";
import { twMerge } from "tailwind-merge";
import IconImagePlus from "@/assets/icons/image-plus.svg?react";

type Props = ComponentPropsWithoutRef<"div">;

export default function ImagePlaceholder({ className, ...props }: Props) {
  return (
    <div className={twMerge("relative aspect-video w-full", className)} {...props}>
      <div className="absolute inset-0 flex w-full items-center justify-center rounded-lg border-2 border-warm-black-25 border-dashed bg-warm-black-50/5">
        <div className="text-center">
          <IconImagePlus className="mx-auto mb-2 h-8 w-8 text-warm-black-25" />
          <span className="text-sm text-warm-black-50">画像をえらぶ</span>
        </div>
      </div>
    </div>
  );
}
