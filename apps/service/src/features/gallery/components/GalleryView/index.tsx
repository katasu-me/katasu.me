"use client";

import type { ComponentProps } from "react";
import type { InferOutput } from "valibot";
import IconReload from "@/assets/icons/reload.svg";
import Button from "@/components/Button";
import type { GalleryViewSchema } from "../../schemas/view";
import DraggableImages from "../DraggableImages";
import type FrameImage from "../FrameImage";
import ImageDropArea from "../ImageDropArea";
import LayoutToggle from "../LayoutToggle";
import MasonryImageLayout from "../MasonryImageLayout";

type Props = {
  view: InferOutput<typeof GalleryViewSchema>;
  images: ComponentProps<typeof FrameImage>[];
  totalImageCount: number;
  currentPage?: number;
  defaultTags?: string[];
  showUploadArea?: boolean;
};

export default function GalleryView({ view, images, totalImageCount, currentPage, defaultTags, showUploadArea = true }: Props) {
  const handleSwapClick = () => {
    window.location.reload();
  };

  return (
    <>
      {showUploadArea && (
        <div className="col-start-2">
          <ImageDropArea title="あたらしい画像を投稿する" defaultTags={defaultTags} />
        </div>
      )}

      {view === "random" ? (
        <>
          <DraggableImages className="col-span-full" images={images} />
          <Button className="col-start-2 mx-auto flex items-center gap-2" onClick={handleSwapClick}>
            <IconReload className="h-4 w-4" />
            画像をいれかえる
          </Button>
        </>
      ) : (
        <MasonryImageLayout
          className="col-start-2"
          images={images}
          totalImageCount={totalImageCount}
          currentPage={currentPage}
        />
      )}

      <LayoutToggle className="-translate-x-1/2 fixed bottom-6 left-1/2 z-[calc(infinity)]" value={view || "masonry"} />
    </>
  );
}
