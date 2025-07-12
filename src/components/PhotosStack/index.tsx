"use client";

import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import type { FrameImageProps } from "../FrameImage";
import DraggablePhoto from "./DraggableImage";

type Props = {
  items: FrameImageProps[];
  className?: string;
};

const getRandomPosition = () => {
  // ビューポートの中心からの相対位置として計算
  const margin = 200; // 画像の半分程度のマージン
  const maxX = (window.innerWidth - margin * 2) / 2;
  const maxY = (window.innerHeight - margin * 2) / 2;

  return {
    x: -maxX + Math.random() * maxX * 2,
    y: -maxY + Math.random() * maxY * 2,
    rotation: -45 + Math.random() * 90,
  };
};

export default function PhotosStack({ items, className }: Props) {
  const [positions] = useState(() => items.map(() => getRandomPosition()));

  const containerRef = useRef<HTMLDivElement>(null);
  const maxZIndex = useRef(2);

  useEffect(() => {
    const preventDefault = (e: Event) => e.preventDefault();
    document.addEventListener("gesturestart", preventDefault);
    document.addEventListener("gesturechange", preventDefault);

    return () => {
      document.removeEventListener("gesturestart", preventDefault);
      document.removeEventListener("gesturechange", preventDefault);
    };
  }, []);

  return (
    <div ref={containerRef} className={twMerge("relative flex h-screen w-full items-center justify-center", className)}>
      {items.map((item, i) => (
        <DraggablePhoto
          key={i.toString()}
          item={item}
          initialPosition={positions[i]}
          maxZIndex={maxZIndex}
          delay={i * 0.05}
        />
      ))}
    </div>
  );
}
