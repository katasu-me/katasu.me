import { motion } from "motion/react";
import { type ComponentProps, useLayoutEffect, useRef, useState } from "react";
import type FrameImage from "@/components/FrameImage";
import { useDevice } from "@/hooks/useDevice";
import DraggableImage, { type Position } from "../DraggableImage";

type Props = {
  images: ComponentProps<typeof FrameImage>[];
  isScattering: boolean;
  onScatterComplete: () => void;
};

const RANDOM_POSITION_MARGIN = 200; // 画像の半分程度のマージン

const getRandomPosition = (container?: HTMLDivElement | null): Position => {
  const containerWidth = container?.clientWidth ?? window.innerWidth;
  const containerHeight = container?.clientHeight ?? window.innerHeight;

  const maxX = (containerWidth - RANDOM_POSITION_MARGIN * 2) / 2;
  const maxY = (containerHeight - RANDOM_POSITION_MARGIN * 2) / 2;

  return {
    x: -maxX + Math.random() * maxX * 2,
    y: -maxY + Math.random() * maxY * 2,
    rotation: -45 + Math.random() * 90,
  };
};

export default function DraggableImages({ images, isScattering, onScatterComplete }: Props) {
  const { isDesktop } = useDevice();
  const [positions, setPositions] = useState<Position[]>([]);

  const maxZIndex = useRef(2);
  const containerRef = useRef<HTMLDivElement>(null);

  // 画像が変更されたら位置を再計算
  useLayoutEffect(() => {
    if (containerRef.current) {
      setPositions(images.map(() => getRandomPosition(containerRef.current)));
    }
  }, [images]);

  const horizontalMaxWidth = isDesktop ? 400 : 300;
  const verticalMaxWidth = isDesktop ? 250 : 200;

  return (
    <motion.div
      ref={containerRef}
      className="relative col-span-full flex h-[80vh] w-full items-center justify-center overflow-x-clip"
    >
      {images.map((image, i) => {
        const initialPosition = positions[i] ?? { x: 0, y: 0, rotation: 0 };
        const delay = i * 0.05;
        const isLastImage = i === images.length - 1;

        return (
          <DraggableImage
            key={image.id}
            image={image}
            initialPosition={initialPosition}
            delay={delay}
            containerRef={containerRef}
            maxZIndex={maxZIndex}
            horizontalMaxWidth={horizontalMaxWidth}
            verticalMaxWidth={verticalMaxWidth}
            isScattering={isScattering}
            onScatterComplete={isLastImage ? onScatterComplete : undefined}
          />
        );
      })}
    </motion.div>
  );
}
