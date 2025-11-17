import { Link } from "@tanstack/react-router";
import { motion, useMotionValue, useTransform } from "motion/react";
import { type ComponentProps, type RefObject, useMemo } from "react";
import { twJoin } from "tailwind-merge";
import type FrameImage from "@/components/FrameImage";
import { DEFAULT_IMAGE_TITLE } from "@/features/gallery/constants/page";

export type Position = {
  x: number;
  y: number;
  rotation: number;
};

type Props = {
  image: ComponentProps<typeof FrameImage>;
  initialPosition: Position;
  delay: number;
  containerRef: RefObject<HTMLDivElement | null>;
  maxZIndex: RefObject<number>;
  horizontalMaxWidth: number;
  verticalMaxWidth: number;
  isScattering: boolean;
  onScatterComplete?: () => void;
};

export default function DraggableImage({
  image: { src, alt, width, height, linkParams },
  initialPosition,
  delay,
  containerRef,
  maxZIndex,
  horizontalMaxWidth,
  verticalMaxWidth,
  isScattering,
  onScatterComplete,
}: Props) {
  const x = useMotionValue(initialPosition.x);
  const y = useMotionValue(initialPosition.y);
  const zIndex = useMotionValue(2);
  const scale = useMotionValue(1);

  const rotateY = useTransform(x, [initialPosition.x - 100, initialPosition.x + 100], [-10, 10]);

  const rotateZ = useTransform([x, y], ([latestX, latestY]) => {
    const deltaX = (latestX as number) - initialPosition.x;
    const deltaY = (latestY as number) - initialPosition.y;

    return initialPosition.rotation + deltaX * 0.02 + deltaY * 0.01;
  });

  const updateZIndex = () => {
    // 要素を最前面に
    maxZIndex.current++;
    zIndex.set(maxZIndex.current);
  };

  // 再シャッフル時の移動方向
  const scatterOffset = useMemo(() => {
    const isLeft = Math.random() < 0.5;
    const xOffset = Math.random() * 150;
    const yOffset = Math.random() * 150;

    return {
      x: isLeft ? -xOffset : xOffset,
      y: yOffset,
      rotation: isLeft ? -30 - Math.random() * 15 : 30 + Math.random() * 15,
    };
  }, []);

  return (
    <motion.div
      className="absolute touch-none select-none rounded-sm bg-white p-3 pb-4 pc:pb-6 shadow-lg hover:cursor-grab active:cursor-grabbing"
      style={{
        x,
        y,
        zIndex,
        width: width > height ? horizontalMaxWidth : verticalMaxWidth,
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
      animate={
        isScattering
          ? {
              x: initialPosition.x + scatterOffset.x,
              y: initialPosition.y + scatterOffset.y,
              opacity: 0,
              scale: 1,
              filter: "blur(16px)",
              rotateZ: scatterOffset.rotation,
            }
          : {
              x: initialPosition.x,
              y: initialPosition.y,
              opacity: 1,
              scale: 1,
              filter: "blur(0px)",
            }
      }
      transition={
        isScattering
          ? {
              duration: 0.3,
              ease: [0.4, 0, 0.6, 1],
            }
          : {
              type: "spring",
              delay,
              mass: 5,
              stiffness: 550,
              damping: 100,
            }
      }
      onAnimationComplete={() => {
        if (isScattering && onScatterComplete) {
          onScatterComplete();
        }
      }}
      drag
      dragConstraints={{
        top: containerRef.current ? -containerRef.current.clientHeight * 0.5 : Number.NEGATIVE_INFINITY,
        bottom: containerRef.current ? containerRef.current.clientHeight * 0.5 : Number.POSITIVE_INFINITY,
        left: containerRef.current ? -containerRef.current.clientWidth * 0.5 : Number.NEGATIVE_INFINITY,
        right: containerRef.current ? containerRef.current.clientWidth * 0.5 : Number.POSITIVE_INFINITY,
      }}
      onDragStart={updateZIndex}
    >
      <div className="relative w-full overflow-hidden bg-warm-black-25" style={{ aspectRatio: `${width} / ${height}` }}>
        <img className="pointer-events-none absolute top-0 left-0 h-full w-full object-cover" src={src} alt={alt} />
      </div>
      {linkParams && (
        <Link
          className={twJoin([
            "mx-auto line-clamp-1 w-fit underline decoration-dashed transition-colors duration-400 ease-magnetic",
            "mt-3 px-1 pb-1 text-warm-black-50 text-xs decoration-warm-black-50 underline-offset-5",
            "pc:mt-4 pc:pb-0 pc:text-sm pc:underline-offset-4",
            "hover:text-warm-black hover:decoration-warm-black",
          ])}
          to="/"
          // TODO:
          // to="/user/$userId/image/$imageId"
          // params={{
          //   userId: linkParams.userId,
          //   imageId: linkParams.imageId,
          // }}
        >
          {alt || DEFAULT_IMAGE_TITLE}
        </Link>
      )}
    </motion.div>
  );
}
