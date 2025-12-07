import type { ReactNode } from "react";

type StatusOverlayProps = {
  icon: ReactNode;
};

export default function StatusOverlay({ icon }: StatusOverlayProps) {
  return (
    <div className="pointer-events-none absolute top-0 left-0 flex h-full w-full flex-col items-center justify-center gap-1 bg-warm-black-100 p-4">
      {icon}
    </div>
  );
}
