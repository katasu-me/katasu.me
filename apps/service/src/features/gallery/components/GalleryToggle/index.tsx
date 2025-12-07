import { Link, useLocation } from "@tanstack/react-router";
import { twJoin, twMerge } from "tailwind-merge";
import ShuffleIcon from "@/assets/icons/arrows-shuffle.svg?react";
import MasonryIcon from "@/assets/icons/masonry.svg?react";
import type { GalleryView } from "../../schemas/view";

type Props = {
  value: GalleryView;
  onRandomClick?: () => void;
  className?: string;
};

export default function GalleryToggle({ value, onRandomClick, className }: Props) {
  const location = useLocation();

  const selectedClassname = "interactive-base bg-warm-black text-warm-white shadow-sm";
  const unselectedClassname = "interactive-scale-brightness text-warm-black-50 hover:text-warm-black";
  const randomButtonClassname = "flex w-32 items-center justify-center gap-2 rounded-md px-4 py-2 font-medium text-sm";

  return (
    <div
      className={twMerge("flex rounded-lg border-2 border-warm-white bg-warm-black-25 p-1", className)}
      role="tablist"
      aria-label="Layout selection"
    >
      <Link
        className={twMerge(
          "flex w-32 items-center justify-center gap-2 rounded-md px-4 py-2 font-medium text-sm",
          value === "timeline" ? selectedClassname : unselectedClassname,
        )}
        role="tab"
        aria-selected={value === "timeline"}
        aria-controls="timeline-layout"
        to={location.pathname}
        search={{
          view: "timeline",
        }}
      >
        <MasonryIcon className="h-4 w-4" />
        <span>一覧</span>
      </Link>

      {value === "random" ? (
        <button
          className={twJoin(
            "interactive-scale-brightness cursor-pointer bg-warm-black text-warm-white shadow-sm",
            randomButtonClassname,
          )}
          onClick={onRandomClick}
        >
          <ShuffleIcon className="h-4 w-4" />
          <span>シャッフル</span>
        </button>
      ) : (
        <Link
          className={twJoin(randomButtonClassname, unselectedClassname)}
          role="tab"
          aria-controls="random-layout"
          to={location.pathname}
          search={{
            view: "random",
          }}
        >
          <ShuffleIcon className="h-4 w-4" />
          <span>シャッフル</span>
        </Link>
      )}
    </div>
  );
}
