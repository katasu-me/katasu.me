"use client";

import { useSearchParams } from "next/navigation";
import { type ComponentProps, useEffect, useMemo, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import Pagination from "@/components/Pagination";
import FrameImage from "../FrameImage";

const DEFAULT_COLUMNS = 2;

/** 画面幅とカラム数のマッピング */
const COLUMNS = new Map([
  [640, 2], // sm
  [768, 3], // md
  [1024, 4], // lg
]);

type Props = {
  images: Omit<ComponentProps<typeof FrameImage>, "requireConfirmation">[];
  currentPage?: number;
  itemsPerPage?: number;
  className?: string;
};

export default function MasonryImageLayout({ images, currentPage = 1, itemsPerPage = 20, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(DEFAULT_COLUMNS);
  const [isReady, setIsReady] = useState(false);

  const searchParams = useSearchParams();

  useEffect(() => {
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
      if (!isReady) {
        setIsReady(true);
      }
    };

    const resizeObserver = new ResizeObserver(updateColumns);

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [isReady]);

  const paginatedImages = images.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(images.length / itemsPerPage);

  const imageColumns = useMemo(() => {
    const cols: ComponentProps<typeof FrameImage>[][] = Array.from({ length: columns }, () => []);
    const colHeights = new Array(columns).fill(0);

    for (const image of paginatedImages) {
      const shortestCol = colHeights.indexOf(Math.min(...colHeights));
      cols[shortestCol].push(image);
      colHeights[shortestCol] += image.height / image.width;
    }

    return cols;
  }, [paginatedImages, columns]);

  return (
    <div className={twMerge("flex flex-col gap-6", className)}>
      <div
        ref={containerRef}
        className={twMerge(
          "flex w-full gap-3 transition-opacity duration-400 ease-magnetic",
          isReady ? "opacity-100" : "opacity-0",
        )}
      >
        {imageColumns.map((column, colIndex) => (
          <div key={colIndex.toString()} className="flex flex-1 flex-col gap-3">
            {column.map((image) => (
              <FrameImage key={image.id} className="h-auto w-full" {...image} />
            ))}
          </div>
        ))}
      </div>
      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} searchParams={searchParams} className="mt-4" />
      )}
    </div>
  );
}
