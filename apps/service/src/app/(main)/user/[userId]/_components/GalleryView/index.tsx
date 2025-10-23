"use client";

import { type ComponentProps, useState } from "react";
import type { InferOutput } from "valibot";
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

const getRandomViewId = () => Math.floor(Date.now() / 1000).toString();

export default function GalleryView({ view, images, totalImageCount, currentPage }: Props) {
  const [randomViewId, setRandomViewId] = useState(getRandomViewId());

  const handleSwapClick = () => {
    setRandomViewId(getRandomViewId());
  };

  return (
    <>
      {view === "random" ? (
        <Random key={randomViewId} className="col-span-full" images={images} />
      ) : (
        <Timeline className="col-start-2" images={images} totalImageCount={totalImageCount} currentPage={currentPage} />
      )}

      <LayoutToggle
        className="-translate-x-1/2 fixed bottom-6 left-1/2 z-[calc(infinity)]"
        value={view || "masonry"}
        onRandomClick={handleSwapClick}
      />
    </>
  );
}
