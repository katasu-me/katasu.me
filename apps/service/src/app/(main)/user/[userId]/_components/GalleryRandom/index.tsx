"use client";

import { type ComponentProps, useCallback, useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import Message from "@/components/Message";
import { useDevice } from "@/contexts/DeviceContext";
import { fetchRandomImages } from "../../_actions/fetch-random-images";
import { toFrameImageProps } from "../../_lib/convert";
import type { FetchRandomImagesOptions } from "../../_types/fetch-random-images";
import type FrameImage from "../FrameImage";
import GalleryToggle from "../GalleryToggle";
import DraggableImage from "./DraggableImage";

type Props = {
  className?: string;
  fetchRandomOptions: FetchRandomImagesOptions;
};

const SHAKE_THRESHOLD = 15;
const SHAKE_COOLDOWN = 500;

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

export default function GalleryRandom({ className, fetchRandomOptions }: Props) {
  const [images, setImages] = useState<ComponentProps<typeof FrameImage>[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isDesktop } = useDevice();

  const containerRef = useRef<HTMLDivElement>(null);
  const maxZIndex = useRef(2);

  // ランダム表示を更新
  const fetchImages = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await fetchRandomImages(fetchRandomOptions);

    if (!result.success) {
      setError(result.error.message);
      setIsLoading(false);
      return;
    }

    const imageProps = result.data.map((image) => toFrameImageProps(image, image.userId));
    setImages(imageProps);

    if (containerRef.current) {
      setPositions(imageProps.map(() => getRandomPosition(containerRef.current)));
    }

    setIsLoading(false);
  }, [fetchRandomOptions]);

  // 画像取得
  useEffect(() => {
    const preventDefault = (e: Event) => e.preventDefault();
    document.addEventListener("gesturestart", preventDefault);
    document.addEventListener("gesturechange", preventDefault);

    fetchImages();

    return () => {
      document.removeEventListener("gesturestart", preventDefault);
      document.removeEventListener("gesturechange", preventDefault);
    };
  }, [fetchImages]);

  // シェイク検知
  useEffect(() => {
    if (isDesktop) {
      return;
    }

    let lastX = 0;
    let lastY = 0;
    let lastZ = 0;
    let lastShakeTime = 0;

    const handleMotion = (event: DeviceMotionEvent) => {
      const acceleration = event.accelerationIncludingGravity;
      if (!acceleration) {
        return;
      }

      const x = acceleration.x ?? 0;
      const y = acceleration.y ?? 0;
      const z = acceleration.z ?? 0;
      const currentTime = Date.now();

      // 初回は基準値として保存
      if (lastX === 0 && lastY === 0 && lastZ === 0) {
        lastX = x;
        lastY = y;
        lastZ = z;
        return;
      }

      // 変化量
      const deltaX = Math.abs(x - lastX);
      const deltaY = Math.abs(y - lastY);
      const deltaZ = Math.abs(z - lastZ);
      const totalDelta = deltaX + deltaY + deltaZ;

      // シェイクされたらランダム表示を更新する
      if (totalDelta > SHAKE_THRESHOLD && currentTime - lastShakeTime > SHAKE_COOLDOWN) {
        fetchImages();
        lastShakeTime = currentTime;
      }

      lastX = x;
      lastY = y;
      lastZ = z;
    };

    window.addEventListener("devicemotion", handleMotion);

    return () => {
      window.removeEventListener("devicemotion", handleMotion);
    };
  }, [isDesktop, fetchImages]);

  if (error) {
    return <Message message={error} icon="error" />;
  }

  return (
    <>
      <div
        ref={containerRef}
        className={twMerge(
          // FIXME: タブレットくらいのサイズで若干の横スクロールが発生する
          "relative col-span-full flex h-[80vh] w-full items-center justify-center overflow-x-clip",
          className,
        )}
      >
        {!isLoading &&
          images.map((item, i) => (
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

      <GalleryToggle
        className="-translate-x-1/2 fixed bottom-6 left-1/2 z-[calc(infinity)]"
        value="random"
        onRandomClick={() => fetchImages()}
      />
    </>
  );
}
