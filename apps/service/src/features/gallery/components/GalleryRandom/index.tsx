import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  userSlug?: string;
};

export default function GalleryRandom({ fetchOptions, userSlug }: Props) {
  const queryClient = useQueryClient();
  const [isScattering, setIsScattering] = useState(false);
  const [imagesKey, setImagesKey] = useState(() => Date.now());

  const { data } = useSuspenseQuery(randomImagesQueryOptions(fetchOptions));

  const images = useMemo(() => {
    if (!data) {
      return [];
    }

    return data.map((image) => toFrameImageProps(image, "thumbnail", userSlug));
  }, [data, userSlug]);

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

  return (
    <>
      <DraggableImages
        key={imagesKey}
        images={images}
        isScattering={isScattering}
        onScatterComplete={handleScatterComplete}
      />
      <GalleryToggle
        className="fixed bottom-6 left-1/2 z-floating -translate-x-1/2"
        value="random"
        onRandomClick={() => setIsScattering(true)}
      />
    </>
  );
}
