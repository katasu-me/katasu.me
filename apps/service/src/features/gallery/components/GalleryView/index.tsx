import type { ComponentProps } from "react";
import { type InferOutput, literal, union } from "valibot";
import IconReload from "@/assets/icons/reload.svg";
import Button from "@/components/Button";
import DraggableImages from "../DraggableImages";
import type FrameImage from "../FrameImage";
import ImageDropArea from "../ImageDropArea";
import LayoutToggle from "../LayoutToggle";
import MasonryImageLayout from "../MasonryImageLayout";

export const GalleryViewSchema = union([literal("masonry"), literal("random")]);

type Props = {
  view: InferOutput<typeof GalleryViewSchema>;
  images: ComponentProps<typeof FrameImage>[];
};

export default function GalleryView({ view, images }: Props) {
  return (
    <>
      <div className="col-start-2">
        <ImageDropArea title="あたらしい画像をおく" />
      </div>

      {view === "random" ? (
        <>
          <DraggableImages className="col-span-full pc:col-auto pc:col-start-2" items={images} />
          <Button className="col-start-2 mx-auto flex items-center gap-2">
            <IconReload className="h-4 w-4" />
            画像をいれかえる
          </Button>
        </>
      ) : (
        <MasonryImageLayout className="col-start-2" images={images} />
      )}

      <LayoutToggle className="-translate-x-1/2 fixed bottom-6 left-1/2 z-10" value={view || "masonry"} />
    </>
  );
}
