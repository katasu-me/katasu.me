import { type ComponentProps, useCallback, useEffect, useState } from "react";
import type FrameImage from "@/components/FrameImage";
import { useDevice } from "@/hooks/useDevice";
import { toFrameImageProps } from "../../libs/convert";
import { fetchRandomImagesFn } from "../../server-fn/fetch-random";
import GalleryToggle from "../GalleryToggle";
import DraggableImages from "./DraggableImages";

type Props = {
  userId: string;
  initialImages: Omit<ComponentProps<typeof FrameImage>, "requireConfirmation">[];
};

const SHAKE_THRESHOLD = 15;
const SHAKE_COOLDOWN = 500;

export default function GalleryRandom({ userId, initialImages }: Props) {
  const { isDesktop } = useDevice();
  const [images, setImages] = useState(initialImages);
  const [isScattering, setIsScattering] = useState(false);
  const [imagesKey, setImagesKey] = useState(0);

  // ランダム画像を取得
  const fetchImages = useCallback(async () => {
    const images = await fetchRandomImagesFn({ data: { type: "user", userId } });
    const frameImages = images.map((image) => toFrameImageProps(image, userId));

    setImages(frameImages);
  }, [userId]);

  // 初期表示時に画像を取得
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

  // 再シャッフル
  const handleScatterComplete = useCallback(async () => {
    await fetchImages();
    setImagesKey((prev) => prev + 1);
    setIsScattering(false);
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
        lastShakeTime = currentTime;
        setIsScattering(true);
      }

      lastX = x;
      lastY = y;
      lastZ = z;
    };

    window.addEventListener("devicemotion", handleMotion);

    return () => {
      window.removeEventListener("devicemotion", handleMotion);
    };
  }, [isDesktop]);

  return (
    <>
      <DraggableImages
        key={imagesKey}
        images={images}
        isScattering={isScattering}
        onScatterComplete={handleScatterComplete}
      />
      <GalleryToggle
        className="-translate-x-1/2 fixed bottom-6 left-1/2 z-[calc(infinity)]"
        value="random"
        onRandomClick={() => setIsScattering(true)}
      />
    </>
  );
}
