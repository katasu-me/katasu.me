"use client";

import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import type { FrameImageProps } from "../FrameImage";
import DraggableImage from "./DraggableImage";

type Props = {
  items: FrameImageProps[];
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

const getRandomPosition = (): Position => {
  const margin = 200; // 画像の半分程度のマージン
  const maxX = (window.innerWidth - margin * 2) / 2;
  const maxY = (window.innerHeight - margin * 2) / 2;

  return {
    x: -maxX + Math.random() * maxX * 2,
    y: -maxY + Math.random() * maxY * 2,
    rotation: -45 + Math.random() * 90,
  };
};

export default function DraggableImages({ items, className }: Props) {
  const [positions, setPositions] = useState<Position[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const maxZIndex = useRef(2);

  useEffect(() => {
    const preventDefault = (e: Event) => e.preventDefault();
    document.addEventListener("gesturestart", preventDefault);
    document.addEventListener("gesturechange", preventDefault);

    setPositions(items.map(() => getRandomPosition()));

    return () => {
      document.removeEventListener("gesturestart", preventDefault);
      document.removeEventListener("gesturechange", preventDefault);
    };
  }, [items.map]);

  return (
    <div ref={containerRef} className={twMerge("relative flex h-screen w-full items-center justify-center", className)}>
      {items.map((item, i) => (
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
