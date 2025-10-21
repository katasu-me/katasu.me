"use client";

import type { ComponentProps } from "react";
import type { InferOutput } from "valibot";
import IconReload from "@/assets/icons/reload.svg";
import Button from "@/components/Button";
import type { GalleryViewSchema } from "../../_schemas/view";
import type FrameImage from "../FrameImage";
import LayoutToggle from "./LayoutToggle";
import Random from "./Random";
import Timeline from "./Timeline";

type Props = {
  view: InferOutput<typeof GalleryViewSchema>;
  images: ComponentProps<typeof FrameImage>[];
  totalImageCount: number;
  currentPage?: number;
  defaultTags?: string[];
};

export default function GalleryView({ view, images, totalImageCount, currentPage }: Props) {
  const handleSwapClick = () => {
    window.location.reload();
  };

  return (
    <>
      {view === "random" ? (
        <>
          <Random className="col-span-full" images={images} />
          <Button className="col-start-2 mx-auto flex items-center gap-2" onClick={handleSwapClick}>
            <IconReload className="h-4 w-4" />
            画像をいれかえる
          </Button>
        </>
      ) : (
        <Timeline className="col-start-2" images={images} totalImageCount={totalImageCount} currentPage={currentPage} />
      )}

      <LayoutToggle className="-translate-x-1/2 fixed bottom-6 left-1/2 z-[calc(infinity)]" value={view || "masonry"} />
    </>
  );
}
