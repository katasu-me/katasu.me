import { type ComponentProps, useEffect, useRef, useState } from "react";
import { css } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";
import FrameImage from "@/components/FrameImage";
import Message from "@/components/Message";
import Pagination from "@/components/Pagination";
import { GALLERY_PAGE_SIZE } from "../../constants/page";

const DEFAULT_COLUMNS = 2;

const COLUMNS = new Map([
  [640, 2],
  [768, 3],
  [1024, 4],
]);

type Props = {
  images: ComponentProps<typeof FrameImage>[];
  totalImageCount: number;
  currentPage: number;
  itemsPerPage?: number;
  cssProps?: SystemStyleObject;
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
  cssProps,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(DEFAULT_COLUMNS);
  const [isReady, setIsReady] = useState(false);

  const hasImages = totalImageCount > 0;

  useEffect(() => {
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

      const width = entry.contentRect.width;

      for (const [breakpoint, colCount] of COLUMNS.entries()) {
        if (width <= breakpoint) {
          setColumns(colCount);
          break;
        }
      }

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
    <div className={css({ display: "flex", flexDirection: "column", gap: "6" }, cssProps)}>
      <div
        ref={containerRef}
        className={css({
          display: "flex",
          w: "full",
          gap: { base: "2", pc: "3" },
          opacity: isReady ? "1" : "0",
          transition: "opacity 400ms token(easings.magnetic)",
        })}
      >
        {imageColumns.map((column, colIndex) => (
          <div
            key={colIndex.toString()}
            className={css({ display: "flex", flex: "1", flexDirection: "column", gap: { base: "2", pc: "3" } })}
          >
            {column.map((image) => (
              <FrameImage key={image.id} cssProps={css.raw({ w: "full", h: "auto" })} {...image} />
            ))}
          </div>
        ))}
      </div>
      {totalPages > 1 && (
        <Pagination cssProps={css.raw({ mt: "4" })} currentPage={currentPage} totalPages={totalPages} />
      )}
    </div>
  );
}
