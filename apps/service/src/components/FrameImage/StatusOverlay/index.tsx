import type { ReactNode } from "react";
import { css } from "styled-system/css";

type StatusOverlayProps = {
  icon: ReactNode;
};

export default function StatusOverlay({ icon }: StatusOverlayProps) {
  return (
    <div
      className={css({
        pointerEvents: "none",
        position: "absolute",
        top: "0",
        left: "0",
        display: "flex",
        w: "full",
        h: "full",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1",
        bg: "warm-black-100",
        p: "4",
      })}
    >
      {icon}
    </div>
  );
}
