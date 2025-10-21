import Link from "next/link";
import { twMerge } from "tailwind-merge";
import ShuffleIcon from "@/assets/icons/arrows-shuffle.svg";
import MasonryIcon from "@/assets/icons/masonry.svg";
import type { ImageLayoutType } from "../../../_types/layout";

type Props = {
  value: ImageLayoutType;
  className?: string;
};

export default function LayoutToggle({ value, className }: Props) {
  const selectedClassname = "interactive-base bg-warm-black text-warm-white shadow-sm";
  const unselectedClassname = "interactive-scale-brightness text-warm-black-50 hover:text-warm-black";

  return (
    <div
      className={twMerge("flex rounded-lg bg-warm-black-25 p-1", className)}
      role="tablist"
      aria-label="Layout selection"
    >
      <Link
        href={{ search: "?view=timeline" }}
        className={twMerge(
          "flex w-32 items-center justify-center gap-2 rounded-md px-4 py-2 font-medium text-sm",
          value === "timeline" ? selectedClassname : unselectedClassname,
        )}
        role="tab"
        aria-selected={value === "timeline"}
        aria-controls="timeline-layout"
      >
        <MasonryIcon className="h-4 w-4" />
        <span>一覧</span>
      </Link>
      <Link
        href={{ search: "?view=random" }}
        className={twMerge(
          "flex w-32 items-center justify-center gap-2 rounded-md px-4 py-2 font-medium text-sm",
          value === "random" ? selectedClassname : unselectedClassname,
        )}
        role="tab"
        aria-selected={value === "random"}
        aria-controls="random-layout"
      >
        <ShuffleIcon className="h-4 w-4" />
        <span>シャッフル</span>
      </Link>
    </div>
  );
}
