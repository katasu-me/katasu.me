import Link from "next/link";
import { twMerge } from "tailwind-merge";
import ShuffleIcon from "@/assets/icons/arrows-shuffle.svg";
import MasonryIcon from "@/assets/icons/masonry.svg";
import type { LayoutType } from "@/types/layout";

type Props = {
  value: LayoutType;
  masonryHref: string;
  randomHref: string;
  className?: string;
};

export default function LayoutToggle({ value, masonryHref, randomHref, className }: Props) {
  const selectedClassname = "bg-warm-black text-warm-white shadow-sm";
  const unselectedClassname = "text-warm-black-50 hover:text-warm-black";

  return (
    <div
      className={twMerge("flex rounded-lg bg-warm-black-25 p-1", className)}
      role="tablist"
      aria-label="Layout selection"
    >
      <Link
        href={masonryHref}
        className={twMerge(
          "flex items-center gap-2 rounded-md px-4 py-2 font-medium text-sm transition-all duration-400 ease-magnetic",
          value === "masonry" ? selectedClassname : unselectedClassname,
        )}
        role="tab"
        aria-selected={value === "masonry"}
        aria-controls="masonry-layout"
      >
        <MasonryIcon className="h-4 w-4" />
      </Link>
      <Link
        href={randomHref}
        className={twMerge(
          "flex items-center gap-2 rounded-md px-4 py-2 font-medium text-sm transition-all duration-400 ease-magnetic",
          value === "random" ? selectedClassname : unselectedClassname,
        )}
        role="tab"
        aria-selected={value === "random"}
        aria-controls="random-layout"
      >
        <ShuffleIcon className="h-4 w-4" />
      </Link>
    </div>
  );
}
