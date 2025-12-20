import { type ComponentProps, useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import FrameImage from "@/components/FrameImage";
import Message from "@/components/Message";
import Pagination from "@/components/Pagination";
import { GALLERY_PAGE_SIZE } from "../../constants/page";
import GalleryToggle from "../GalleryToggle";

const DEFAULT_COLUMNS = 2;

/** 画面幅とカラム数のマッピング */
const COLUMNS = new Map([
  [640, 2], // sm
  [768, 3], // md
  [1024, 4], // lg
]);

type Props = {
  images: ComponentProps<typeof FrameImage>[];
  totalImageCount: number;
  currentPage: number;
  itemsPerPage?: number;
  className?: string;
};

function getImageColumns(paginatedImages: Props["images"], columns: number) {
  const cols: ComponentProps<typeof FrameImage>[][] = Array.from({ length: columns }, () => []);
  const colHeights = new Array(columns).fill(0);

  for (const image of paginatedImages) {
    const shortestCol = colHeights.indexOf(Math.min(...colHeights));
    cols[shortestCol].push(image);
    colHeights[shortestCol] += image.height / image.width;
  }

  return cols;
}

export default function GalleryMasonry({
  images,
  totalImageCount,
  currentPage,
  itemsPerPage = GALLERY_PAGE_SIZE,
  className,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(DEFAULT_COLUMNS);
  const [isReady, setIsReady] = useState(false);

  const hasImages = totalImageCount > 0;

  useEffect(() => {
    // 画像がない場合はリセット
    if (!hasImages) {
      setIsReady(false);
      return;
    }

    if (!containerRef.current) {
      return;
    }

    const updateColumns = (entries: ResizeObserverEntry[]) => {
      const entry = entries.at(0);
      if (!entry) {
        return;
      }

      // カラム数をコンポーネントの幅に応じて設定
      const width = entry.contentRect.width;

      for (const [breakpoint, colCount] of COLUMNS.entries()) {
        if (width <= breakpoint) {
          setColumns(colCount);
          break;
        }
      }

      // CLS軽減のため、初回のカラム数設定が完了したらフェードイン
      setIsReady(true);
    };

    const resizeObserver = new ResizeObserver(updateColumns);
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [hasImages]);

  const totalPages = Math.ceil(totalImageCount / itemsPerPage);
  const imageColumns = getImageColumns(images, columns);

  if (totalImageCount <= 0) {
    return <Message message="からっぽです" />;
  }

  return (
    <>
      <div className={twMerge("flex flex-col gap-6", className)}>
        <div
          ref={containerRef}
          className={twMerge(
            "flex w-full gap-2 pc:gap-3 transition-opacity duration-400 ease-magnetic",
            isReady ? "opacity-100" : "opacity-0",
          )}
        >
          {imageColumns.map((column, colIndex) => (
            <div key={colIndex.toString()} className="flex flex-1 flex-col gap-2 pc:gap-3">
              {column.map((image) => (
                <FrameImage key={image.id} className="h-auto w-full" {...image} />
              ))}
            </div>
          ))}
        </div>
        {totalPages > 1 && <Pagination className="mt-4" currentPage={currentPage} totalPages={totalPages} />}
      </div>

      <GalleryToggle className="-translate-x-1/2 fixed bottom-6 left-1/2 z-floating" value="timeline" />
    </>
  );
}
