"use client";

import { motion, useMotionValue, useTransform } from "motion/react";
import { type RefObject, useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import FrameImage from "@/components/FrameImage";

type Photo = {
  src: string;
  alt: string;
  width: number;
  height: number;
  href?: string;
};

type Props = {
  items: Photo[];
  className?: string;
};

const getRandomPosition = () => {
  // ビューポートの中心からの相対位置として計算
  // 画像サイズを考慮してマージンを設定
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [positions] = useState(() => {
    return items.map(() => getRandomPosition());
  });
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
    <div
      ref={containerRef}
      className={twMerge("relative flex h-screen w-full items-center justify-center overflow-hidden", className)}
    >
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

type DraggablePhotoProps = {
  item: Photo;
  initialPosition: { x: number; y: number; rotation: number };
  maxZIndex: RefObject<number>;
  delay: number;
};

function DraggablePhoto({ item, initialPosition, maxZIndex, delay }: DraggablePhotoProps) {
  const [zIndex, setZIndex] = useState(2);
  const x = useMotionValue(initialPosition.x);
  const y = useMotionValue(initialPosition.y);
  const scale = useMotionValue(1);

  const rotateY = useTransform(x, [initialPosition.x - 100, initialPosition.x + 100], [-10, 10]);
  const rotateZ = useTransform([x, y], ([latestX, latestY]) => {
    const deltaX = (latestX as number) - initialPosition.x;
    const deltaY = (latestY as number) - initialPosition.y;
    return initialPosition.rotation + deltaX * 0.02 + deltaY * 0.01;
  });

  return (
    <motion.div
      className="absolute touch-none select-none hover:cursor-grab active:cursor-grabbing"
      style={{ x, y, zIndex }}
      initial={{
        x: 500,
        y: 500,
        opacity: 0,
        scale: 1.5,
        filter: "blur(8px)",
      }}
      animate={{
        x: initialPosition.x,
        y: initialPosition.y,
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
      }}
      transition={{
        delay,
        type: "spring",
        mass: 5,
        stiffness: 550,
        damping: 100,
      }}
      drag
      dragElastic={0.1}
      dragTransition={{ bounceStiffness: 300, bounceDamping: 30 }}
      onDragStart={() => {
        const nextZIndex = maxZIndex.current + 1;
        maxZIndex.current = nextZIndex;
        setZIndex(nextZIndex);
      }}
      onHoverStart={() => scale.set(1.1)}
      onHoverEnd={() => scale.set(1)}
      whileHover={{ scale: 1.1 }}
    >
      <motion.div
        style={{
          rotateY,
          rotateZ,
          scale,
        }}
        className="w-96 lg:w-[33vw]"
      >
        <FrameImage
          src={item.src}
          alt={item.alt}
          width={item.width}
          height={item.height}
          maxSize={{ width: 400, height: 400 }}
          href={item.href}
          enableViewButton
        />
      </motion.div>
    </motion.div>
  );
}
