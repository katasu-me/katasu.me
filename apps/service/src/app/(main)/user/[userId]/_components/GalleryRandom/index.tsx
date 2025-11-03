"use client";

import { type ComponentProps, useCallback, useEffect, useState } from "react";
import { useDevice } from "@/contexts/DeviceContext";
import { fetchRandomImages } from "../../_actions/fetch-random-images";
import { toFrameImageProps } from "../../_lib/convert";
import type { FetchRandomImagesOptions } from "../../_types/fetch-random-images";
import type FrameImage from "../FrameImage";
import GalleryToggle from "../GalleryToggle";
import DraggableImages from "./DraggableImages";

type Props = {
  fetchRandomOptions: FetchRandomImagesOptions;
};

const SHAKE_THRESHOLD = 15;
const SHAKE_COOLDOWN = 500;

export default function GalleryRandom({ fetchRandomOptions }: Props) {
  const [images, setImages] = useState<ComponentProps<typeof FrameImage>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();
  const { isDesktop } = useDevice();

  // ランダム表示を更新
  const fetchImages = useCallback(async () => {
    setIsLoading(true);
    setError(undefined);

    const result = await fetchRandomImages(fetchRandomOptions);

    if (!result.success) {
      setError(result.error.message);
      setIsLoading(false);
      return;
    }

    const imageProps = result.data.map((image) => toFrameImageProps(image, image.userId));
    setImages(imageProps);

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

  return (
    <>
      <DraggableImages images={images} isLoading={isLoading} error={error} />

      <GalleryToggle
        className="-translate-x-1/2 fixed bottom-6 left-1/2 z-[calc(infinity)]"
        value="random"
        onRandomClick={() => fetchImages()}
      />
    </>
  );
}
