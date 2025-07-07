"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import FrameImage from "../FrameImage";

const DEFAULT_COLUMNS = 3;

const BREAKPOINTS_SM = 640;
const BREAKPOINTS_MD = 768;

export interface ImageData {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  title?: string;
}

interface MasonryImageLayoutProps {
  images: ImageData[];
}

export default function MasonryImageLayout({ images }: MasonryImageLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(DEFAULT_COLUMNS);

  useEffect(() => {
    const updateColumns = (entries: ResizeObserverEntry[]) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }

      const width = entry.contentRect.width;

      // カラム数をコンポーネントの幅に応じて設定
      if (width < BREAKPOINTS_SM) {
        setColumns(1);
      } else if (width < BREAKPOINTS_MD) {
        setColumns(2);
      } else {
        setColumns(3);
      }
    };

    const resizeObserver = new ResizeObserver(updateColumns);

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

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
    <div ref={containerRef} className="flex w-full gap-4">
      {imageColumns.map((column, colIndex) => (
        <div key={colIndex.toString()} className="flex flex-1 flex-col gap-4">
          {column.map((image) => (
            <FrameImage
              key={image.id}
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              title={image.title}
              className="h-auto w-full"
            />
          ))}
        </div>
      ))}
    </div>
  );
}
