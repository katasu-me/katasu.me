import type { ComponentProps } from "react";
import IconReload from "@/assets/icons/reload.svg";
import Button from "@/shared/components/Button";
import DraggableImages from "../DraggableImages";
import type FrameImage from "../FrameImage";
import ImageDropArea from "../ImageDropArea";
import LayoutToggle from "../LayoutToggle";
import MasonryImageLayout from "../MasonryImageLayout";

type Props = {
  view: "masonry" | "random";
  images: ComponentProps<typeof FrameImage>[];
  pathname: string;
  searchParams: URLSearchParams | Record<string, string>;
};

export default function ImagesUI({ view, images, pathname, searchParams }: Props) {
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
        <MasonryImageLayout className="col-start-2" images={images} pathname={pathname} searchParams={searchParams} />
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
