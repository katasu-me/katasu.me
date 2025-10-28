import { motion, useMotionValue, useTransform } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { type ComponentProps, type RefObject, useState } from "react";
import { DEFAULT_IMAGE_TITLE } from "../../../image/[imageId]/_constants/title";

type Item = {
  width: number;
  height: number;
  linkParams?: {
    userId: string;
    imageId: string;
  };
} & Pick<ComponentProps<typeof Image>, "src" | "alt">;

type Position = {
  x: number;
  y: number;
  rotation: number;
};

type Props = {
  item: Item;
  initialPosition: Position;
  containerRef: RefObject<HTMLDivElement | null>;
  maxZIndex: RefObject<number>;
  delay: number;
};

const HOROZONTAL_MAX_WIDTH = 400;
const VERTICAL_MAX_WIDTH = 250;

export default function DraggableImage({ item, initialPosition, containerRef, maxZIndex, delay }: Props) {
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

  const updateZIndex = () => {
    // 要素を最前面に
    const nextZIndex = maxZIndex.current + 1;

    maxZIndex.current = nextZIndex;
    setZIndex(nextZIndex);
  };

  return (
    <motion.div
      className="absolute touch-none select-none rounded-sm bg-white p-3 pb-6 shadow-lg hover:cursor-grab active:cursor-grabbing"
      style={{
        x,
        y,
        zIndex,
        width: item.width > item.height ? HOROZONTAL_MAX_WIDTH : VERTICAL_MAX_WIDTH,
        rotateY,
        rotateZ,
        scale,
      }}
      initial={{
        x: 0,
        y: 500,
        opacity: 0,
        scale: 0.85,
        filter: "blur(16px)",
      }}
      animate={{
        x: initialPosition.x,
        y: initialPosition.y,
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
      }}
      transition={{
        type: "spring",
        delay,
        mass: 5,
        stiffness: 550,
        damping: 100,
      }}
      drag
      dragConstraints={containerRef}
      onClick={updateZIndex}
      onDragStart={updateZIndex}
    >
      <div
        className="relative w-full overflow-hidden bg-warm-black-25"
        style={{ aspectRatio: `${item.width} / ${item.height}` }}
      >
        <Image className="pointer-events-none object-cover" src={item.src} alt={item.alt} fill />
      </div>
      {item.linkParams && (
        <Link
          className="mx-auto mt-4 line-clamp-1 w-fit px-1 text-sm text-warm-black-50 underline decoration-warm-black-50 decoration-dashed underline-offset-4 transition-colors duration-400 ease-magnetic hover:text-warm-black hover:decoration-warm-black"
          href={`/user/${item.linkParams.userId}/image/${item.linkParams.imageId}`}
        >
          {item.alt || DEFAULT_IMAGE_TITLE}
        </Link>
      )}
    </motion.div>
  );
}
