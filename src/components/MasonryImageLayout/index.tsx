"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import FrameImage from "../FrameImage";

const DEFAULT_COLUMNS = 2;

/** 画面幅とカラム数のマッピング */
const COLUMNS = new Map([
  [640, 2], // sm
  [768, 3], // md
  [1024, 4], // lg
]);

export type ImageData = {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  href: string;
  title?: string;
};

type MasonryImageLayoutProps = {
  images: ImageData[];
  className?: string;
};

export default function MasonryImageLayout({ images, className }: MasonryImageLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(DEFAULT_COLUMNS);
  const [isReady, setIsReady] = useState(false);

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

  const imageColumns = useMemo(() => {
    const cols: ImageData[][] = Array.from({ length: columns }, () => []);
    const colHeights = new Array(columns).fill(0);

    for (const image of images) {
      const shortestCol = colHeights.indexOf(Math.min(...colHeights));
      cols[shortestCol].push(image);
      colHeights[shortestCol] += image.height / image.width;
    }

    return cols;
  }, [images, columns]);

  return (
    <div
      ref={containerRef}
      className={twMerge(
        "flex w-full gap-3 transition-opacity duration-400 ease-magnetic",
        isReady ? "opacity-100" : "opacity-0",
        className,
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
  );
}
