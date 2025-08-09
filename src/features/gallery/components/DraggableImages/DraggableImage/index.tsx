import { motion, useMotionValue, useTransform } from "motion/react";
import Link from "next/link";
import { type ComponentProps, type RefObject, useRef, useState } from "react";
import { useClickAway } from "react-use";
import { twMerge } from "tailwind-merge";
import FrameImage from "@/features/gallery/components/FrameImage";

type Props = {
  item: ComponentProps<typeof FrameImage>;
  initialPosition: { x: number; y: number; rotation: number };
  containerRef: RefObject<HTMLDivElement | null>;
  maxZIndex: RefObject<number>;
  delay: number;
};

const HOROZONTAL_MAX_WIDTH = 400;
const VERTICAL_MAX_WIDTH = 250;

export default function DraggableImage({ item, initialPosition, containerRef, maxZIndex, delay }: Props) {
  const [zIndex, setZIndex] = useState(2);
  const [isOpenOverlay, setIsOpenOverlay] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(initialPosition.x);
  const y = useMotionValue(initialPosition.y);
  const scale = useMotionValue(1);

  useClickAway(overlayRef, () => {
    setIsOpenOverlay(false);
  });

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

  const handleClick = (e: React.MouseEvent) => {
    updateZIndex();
    if (item.href) {
      e.preventDefault();
      setIsOpenOverlay(true);
    }
  };

  return (
    <motion.div
      className="absolute touch-none select-none hover:cursor-grab active:cursor-grabbing"
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
      onClick={handleClick}
      onDragStart={updateZIndex}
    >
      <FrameImage src={item.src} alt={item.alt} width={item.width} height={item.height} isBlurred={isOpenOverlay} />
      {item.href && isOpenOverlay && (
        <div className={twMerge("absolute inset-0 z-1 flex items-center justify-center")} ref={overlayRef}>
          <Link className="w-fit py-6 text-center text-warm-white hover:underline" href={item.href}>
            この画像をみる
          </Link>
        </div>
      )}
    </motion.div>
  );
}
