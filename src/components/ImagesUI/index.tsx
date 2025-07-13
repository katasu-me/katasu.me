import IconReload from "@/assets/icons/reload.svg";
import Button from "../Button";
import DraggableImages from "../DraggableImages";
import type { FrameImageProps } from "../FrameImage";
import ImageDropArea from "../ImageDropArea";
import LayoutToggle from "../LayoutToggle";
import MasonryImageLayout from "../MasonryImageLayout";

type Props = {
  view: "masonry" | "random";
  images: FrameImageProps[];
};

export default function ImagesUI({ view, images }: Props) {
  return (
    <>
      <div className="col-start-2">
        <ImageDropArea title="あたらしい画像をおく" />
      </div>

      {view === "random" ? (
        <>
          <DraggableImages className="col-span-full" items={images} />
          <Button className="col-start-2 mx-auto flex items-center gap-2">
            <IconReload className="h-4 w-4" />
            画像をいれかえる
          </Button>
        </>
      ) : (
        <MasonryImageLayout className="col-start-2" images={images} />
      )}

      <LayoutToggle
        className="fixed right-6 bottom-6 z-50"
        value={view || "masonry"}
        masonryHref="?view=masonry"
        randomHref="?view=random"
      />
    </>
  );
}
