"use client";

import Image from "next/image";
import Link from "next/link";
import { type ComponentProps, useRef, useState } from "react";
import { useClickAway } from "react-use";
import { twMerge } from "tailwind-merge";

type FrameImageProps = {
  width: number;
  height: number;
  href?: string;
  requireConfirmation?: boolean;
} & Omit<ComponentProps<typeof Image>, "width" | "height">;

export default function FrameImage({
  className,
  width,
  height,
  href,
  requireConfirmation = false,
  ...props
}: FrameImageProps) {
  const [isOpenOverlay, setIsOpenOverlay] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useClickAway(overlayRef, () => {
    setIsOpenOverlay(false);
  });

  const handleClick = () => {
    if (requireConfirmation && href) {
      setIsOpenOverlay(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === " ") && requireConfirmation && href) {
      e.preventDefault();
      setIsOpenOverlay(true);
    }
  };

  const interactiveProps = requireConfirmation
    ? {
        onClick: handleClick,
        onKeyDown: handleKeyDown,
        role: "button" as const,
        tabIndex: 0,
      }
    : {};

  const isFullLink = href && !requireConfirmation;
  const showOverlay = href && requireConfirmation && isOpenOverlay;

  return (
    <div
      className={twMerge(
        "group relative overflow-hidden border-5 border-white bg-warm-black-25 shadow-md transition-transform duration-400 ease-magnetic hover:scale-[101%] active:scale-[99%]",
        requireConfirmation && "hover:cursor-grab active:cursor-grabbing",
        className,
      )}
      style={{ aspectRatio: `${width} / ${height}` }}
      {...interactiveProps}
    >
      {isFullLink && (
        <Link className="focus:outline-none" href={href}>
          {props.alt}
          <span className="absolute inset-0 z-1" />
        </Link>
      )}
      {showOverlay && (
        <div
          className={twMerge(
            "absolute inset-0 z-1 flex items-center justify-center",
            href && requireConfirmation && isOpenOverlay && "backdrop-blur-sm",
          )}
          ref={overlayRef}
        >
          <Link className="w-2/3 py-6 text-center text-warm-white" href={href}>
            この画像をみる
          </Link>
        </div>
      )}
      <Image className="pointer-events-none object-cover transition-all group-hover:brightness-90" fill {...props} />
    </div>
  );
}
