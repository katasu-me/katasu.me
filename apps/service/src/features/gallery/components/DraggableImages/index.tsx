"use client";

import { type ComponentProps, useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import type FrameImage from "../FrameImage";
import DraggableImage from "./DraggableImage";

type Props = {
  images: ComponentProps<typeof FrameImage>[];
  className?: string;
};

type Position = {
  x: number;
  y: number;
  rotation: number;
};

const DEFAULT_POSITION: Position = {
  x: 0,
  y: 0,
  rotation: 0,
};

const getRandomPosition = (container?: HTMLDivElement | null): Position => {
  const margin = 200; // 画像の半分程度のマージン

  const containerWidth = container?.clientWidth ?? window.innerWidth;
  const containerHeight = container?.clientHeight ?? window.innerHeight;

  const maxX = (containerWidth - margin * 2) / 2;
  const maxY = (containerHeight - margin * 2) / 2;

  return {
    x: -maxX + Math.random() * maxX * 2,
    y: -maxY + Math.random() * maxY * 2,
    rotation: -45 + Math.random() * 90,
  };
};

export default function DraggableImages({ images, className }: Props) {
  const [positions, setPositions] = useState<Position[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const maxZIndex = useRef(2);

  useEffect(() => {
    const preventDefault = (e: Event) => e.preventDefault();
    document.addEventListener("gesturestart", preventDefault);
    document.addEventListener("gesturechange", preventDefault);

    if (containerRef.current) {
      setPositions(images.map(() => getRandomPosition(containerRef.current)));
    }

    return () => {
      document.removeEventListener("gesturestart", preventDefault);
      document.removeEventListener("gesturechange", preventDefault);
    };
  }, [images.map]);

  return (
    <div
      ref={containerRef}
      className={twMerge(
        // FIXME: タブレットくらいのサイズで若干の横スクロールが発生する
        "relative flex h-[80vh] w-full items-center justify-center overflow-x-clip",
        className,
      )}
    >
      {images.map((item, i) => (
        <DraggableImage
          key={i.toString()}
          item={item}
          initialPosition={positions.at(i) ?? DEFAULT_POSITION}
          containerRef={containerRef}
          maxZIndex={maxZIndex}
          delay={i * 0.05}
        />
      ))}
    </div>
  );
}
