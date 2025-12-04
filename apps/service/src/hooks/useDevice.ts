import { useEffect, useState } from "react";

const DESKTOP_BREAKPOINT = 768; // md breakpoint

type DeviceType = {
  isDesktop: boolean;
  isMobile: boolean;
};

/**
 * デバイスの種類を判定するフック
 * @returns デバイスの種類（isDesktop, isMobile）
 */
export function useDevice(): DeviceType {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.innerWidth >= DESKTOP_BREAKPOINT;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsDesktop(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return {
    isDesktop,
    isMobile: !isDesktop,
  };
}
