import type { ComponentProps } from "react";
import IconReload from "@/assets/icons/reload.svg";
import Button from "@/components/Button";
import DraggableImages from "../DraggableImages";
import type FrameImage from "../FrameImage";
import ImageDropArea from "../ImageDropArea";
import LayoutToggle from "../LayoutToggle";
import MasonryImageLayout from "../MasonryImageLayout";

type Props = {
  view: "masonry" | "random";
  images: ComponentProps<typeof FrameImage>[];
};

export default function ImagesUI({ view, images }: Props) {
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

      <LayoutToggle className="-translate-x-1/2 fixed bottom-6 left-1/2 z-50" value={view || "masonry"} />
    </>
  );
}
