import type { ReactNode } from "react";

type StatusOverlayProps = {
  icon: ReactNode;
  text?: string;
};

export default function StatusOverlay({ icon, text }: StatusOverlayProps) {
  return (
    <div className="pointer-events-none absolute top-0 left-0 flex h-full w-full flex-col items-center justify-center gap-1 bg-warm-black-100 p-4">
      {icon}
      {text && <span className="text-center font-bold text-warm-black-50 text-xs">{text}</span>}
    </div>
  );
}
