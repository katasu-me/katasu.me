import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDevice } from "@/hooks/useDevice";
import { toFrameImageProps } from "../../libs/convert";
import {
  type FetchRandomImagesInput,
  getRandomImagesQueryKey,
  randomImagesQueryOptions,
} from "../../server-fn/fetch-random";
import GalleryToggle from "../GalleryToggle";
import DraggableImages from "./DraggableImages";

type Props = {
  fetchOptions: FetchRandomImagesInput;
};

const SHAKE_THRESHOLD = 15;
const SHAKE_COOLDOWN = 500;

export default function GalleryRandom({ fetchOptions }: Props) {
  const { isDesktop } = useDevice();
  const queryClient = useQueryClient();
  const [isScattering, setIsScattering] = useState(false);
  const [imagesKey, setImagesKey] = useState(() => Date.now());

  const { data } = useQuery(randomImagesQueryOptions(fetchOptions));

  const images = useMemo(() => {
    if (!data) {
      return [];
    }

    return data.map((image) => toFrameImageProps(image));
  }, [data]);

  // ジェスチャーイベントの抑制
  useEffect(() => {
    const preventDefault = (e: Event) => e.preventDefault();
    document.addEventListener("gesturestart", preventDefault);
    document.addEventListener("gesturechange", preventDefault);

    return () => {
      document.removeEventListener("gesturestart", preventDefault);
      document.removeEventListener("gesturechange", preventDefault);
    };
  }, []);

  // 再シャッフル
  const handleScatterComplete = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: getRandomImagesQueryKey(fetchOptions),
    });

    setImagesKey(Date.now());
    setIsScattering(false);
  }, [queryClient, fetchOptions]);

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
