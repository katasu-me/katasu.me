import { useEffect } from "react";
import { useDevice } from "@/hooks/useDevice";

// シェイク判定の閾値
const SHAKE_THRESHOLD = 128;
const SHAKE_COOLDOWN = 1000;
const SHAKE_ACCUMULATE_WINDOW = 500;
const MOTION_NOISE_FLOOR = 1.5;

/**
 * 端末のシェイクを検知するフック（モバイル端末のみ動作）
 *
 * iOS 13+ では初回のタップを起点にセンサーの利用許可を取得する。
 * onShakeの参照が変わるとリスナーが張り直され、iOSでは次のタップまで検知が
 * 無効になるため、呼び出し側でuseCallback等を使って参照を安定させること。
 *
 * @param onShake しっかり振られたときに呼ばれるコールバック
 */
export function useShakeDetection(onShake: () => void) {
  const { isDesktop } = useDevice();

  useEffect(() => {
    if (isDesktop) {
      return;
    }

    let lastX = 0;
    let lastY = 0;
    let lastZ = 0;
    let initialized = false;
    let accumulated = 0;
    let lastSignificantTime = 0;
    let lastShakeTime = 0;

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

      const totalDelta = Math.abs(x - lastX) + Math.abs(y - lastY) + Math.abs(z - lastZ);
      lastX = x;
      lastY = y;
      lastZ = z;

      // 手ブレ程度の微小な揺れは積算しない
      if (totalDelta <= MOTION_NOISE_FLOOR) {
        return;
      }

      const now = Date.now();

      // 揺れが途切れたら積算をリセット（ゆっくりした動きの積み重ねで誤発火しないように）
      if (now - lastSignificantTime > SHAKE_ACCUMULATE_WINDOW) {
        accumulated = 0;
      }
      lastSignificantTime = now;
      accumulated += totalDelta;

      if (accumulated > SHAKE_THRESHOLD && now - lastShakeTime > SHAKE_COOLDOWN) {
        lastShakeTime = now;
        accumulated = 0;
        onShake();
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
  }, [isDesktop, onShake]);
}
