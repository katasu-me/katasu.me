import { motion } from "motion/react";
import { type ComponentProps, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type FrameImage from "@/components/FrameImage";
import { useDevice } from "@/hooks/useDevice";
import DraggableImage, { type Position } from "../DraggableImage";

type Props = {
  images: ComponentProps<typeof FrameImage>[];
  isScattering: boolean;
  onScatterComplete: () => void;
};

// かき混ぜの適用間隔と強度の閾値
const STIR_INTERVAL = 250;
const STIR_MIN_DELTA = 15;
const STIR_MAX_DELTA = 80;
const MOTION_NOISE_FLOOR = 1.5;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

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
  const [zOrders, setZOrders] = useState<number[]>([]);

  const maxZIndex = useRef(2);
  const containerRef = useRef<HTMLDivElement>(null);

  // 画像が変更されたら位置を再計算
  useLayoutEffect(() => {
    if (containerRef.current) {
      setPositions(images.map(() => getRandomPosition(containerRef.current)));
    }
  }, [images]);

  // 揺れの強さ・向きに応じて写真の位置・回転・重なり順を混ぜ直す
  const stir = useCallback((intensity: number, direction: { x: number; y: number }) => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const maxX = (container.clientWidth - RANDOM_POSITION_MARGIN * 2) / 2;
    const maxY = (container.clientHeight - RANDOM_POSITION_MARGIN * 2) / 2;
    // 揺れが強いほど遠くへ、揺れの向きへ投げ出す
    const throwX = maxX * intensity;
    const throwY = maxY * intensity;

    setPositions((prev) =>
      prev.map((pos) => {
        // 全写真が同じ向きに揃うと不自然なので、飛距離と角度を写真ごとに散らす
        const spread = 0.5 + Math.random();
        const jitter = (Math.random() - 0.5) * (Math.PI / 3);
        const dirX = direction.x * Math.cos(jitter) - direction.y * Math.sin(jitter);
        const dirY = direction.x * Math.sin(jitter) + direction.y * Math.cos(jitter);

        return {
          x: clamp(pos.x + dirX * throwX * spread, -maxX, maxX),
          y: clamp(pos.y + dirY * throwY * spread, -maxY, maxY),
          rotation: clamp(pos.rotation + (Math.random() - 0.5) * intensity * 60, -45, 45),
        };
      }),
    );

    setZOrders((prev) => {
      const shuffled = prev.map((_, i) => i + 2);
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      maxZIndex.current = shuffled.length + 2;
      return shuffled;
    });
  }, []);

  // zOrdersを画像数に合わせて初期化
  useLayoutEffect(() => {
    setZOrders(images.map(() => 2));
  }, [images]);

  // シェイク検知（揺らしたぶんだけかき混ぜる）
  useEffect(() => {
    if (isDesktop) {
      return;
    }

    let lastX = 0;
    let lastY = 0;
    let lastZ = 0;
    let initialized = false;
    let accumulated = 0;
    let lastStirTime = 0;
    let peakDelta = 0;
    let peakDirX = 0;
    let peakDirY = 0;

    const handleMotion = (event: DeviceMotionEvent) => {
      const acceleration = event.accelerationIncludingGravity;
      if (!acceleration) {
        return;
      }

      const x = acceleration.x ?? 0;
      const y = acceleration.y ?? 0;
      const z = acceleration.z ?? 0;

      // 初回は基準値として保存
      if (!initialized) {
        initialized = true;
        lastX = x;
        lastY = y;
        lastZ = z;
        return;
      }

      const deltaX = x - lastX;
      const deltaY = y - lastY;
      const totalDelta = Math.abs(deltaX) + Math.abs(deltaY) + Math.abs(z - lastZ);
      lastX = x;
      lastY = y;
      lastZ = z;

      // 手ブレ程度の微小な揺れは積算しない
      if (totalDelta > MOTION_NOISE_FLOOR) {
        accumulated += totalDelta;

        // 振りは往復して符号付き積算だと打ち消し合うため、区間内で最も強い一撃の向きを採用する
        if (totalDelta > peakDelta) {
          peakDelta = totalDelta;
          // 慣性で写真は端末の移動と逆向きに置いていかれる（画面座標はyが下向き正）
          peakDirX = -deltaX;
          peakDirY = deltaY;
        }
      }

      const now = Date.now();
      if (now - lastStirTime > STIR_INTERVAL && accumulated > STIR_MIN_DELTA) {
        const intensity = Math.min(accumulated, STIR_MAX_DELTA) / STIR_MAX_DELTA;
        const length = Math.hypot(peakDirX, peakDirY);
        // z軸方向のみの揺れなどで向きが取れなかった場合はランダム方向に散らす
        const angle = Math.random() * Math.PI * 2;
        const direction =
          length > 0 ? { x: peakDirX / length, y: peakDirY / length } : { x: Math.cos(angle), y: Math.sin(angle) };

        lastStirTime = now;
        accumulated = 0;
        peakDelta = 0;
        peakDirX = 0;
        peakDirY = 0;
        stir(intensity, direction);
      }
    };

    const attach = () => window.addEventListener("devicemotion", handleMotion);

    // iOS 13+ はユーザー操作を起点に許可を取る必要がある
    const motionEvent = window.DeviceMotionEvent as typeof DeviceMotionEvent & {
      requestPermission?: () => Promise<string>;
    };
    let pointerHandler: (() => void) | undefined;

    if (typeof motionEvent?.requestPermission === "function") {
      pointerHandler = () => {
        motionEvent
          .requestPermission?.()
          .then((state) => {
            if (state === "granted") {
              attach();
            }
          })
          .catch(() => {});

        if (pointerHandler) {
          window.removeEventListener("pointerdown", pointerHandler);
          pointerHandler = undefined;
        }
      };
      window.addEventListener("pointerdown", pointerHandler);
    } else {
      attach();
    }

    return () => {
      window.removeEventListener("devicemotion", handleMotion);
      if (pointerHandler) {
        window.removeEventListener("pointerdown", pointerHandler);
      }
    };
  }, [isDesktop, stir]);

  const horizontalMaxWidth = isDesktop ? 400 : 300;
  const verticalMaxWidth = isDesktop ? 250 : 200;

  // motionのinitialはマウント時にしか反映されないため、位置計算が終わるまで写真をマウントしない
  // （フォールバック値でマウントすると画面外ではなく中央から登場してしまう）
  const isPositionsReady = positions.length === images.length;

  return (
    <motion.div
      ref={containerRef}
      className="relative col-span-full flex h-[80vh] w-full items-center justify-center overflow-x-clip"
    >
      {isPositionsReady &&
        images.map((image, i) => {
          const initialPosition = positions[i] ?? { x: 0, y: 0, rotation: 0 };
          const delay = i * 0.05;
          const isLastImage = i === images.length - 1;

          return (
            <DraggableImage
              key={image.id}
              image={image}
              initialPosition={initialPosition}
              delay={delay}
              zIndexBase={zOrders[i] ?? 2}
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
