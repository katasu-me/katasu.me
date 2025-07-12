"use client";

import Image from "next/image";
import Link from "next/link";
import { type ComponentProps, useRef, useState } from "react";
import { useClickAway } from "react-use";
import { twMerge } from "tailwind-merge";

export type FrameImageProps = {
  width: number;
  height: number;
  href?: string;
  enableViewButton?: boolean;
} & Omit<ComponentProps<typeof Image>, "width" | "height">;

export default function FrameImage({
  className,
  width,
  height,
  href,
  enableViewButton = false,
  ...props
}: FrameImageProps) {
  const [showButton, setShowButton] = useState(false);
  const linkRef = useRef<HTMLDivElement>(null);

  useClickAway(linkRef, () => {
    setShowButton(false);
  });

  const handleClick = () => {
    if (enableViewButton && href) {
      setShowButton(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === " ") && enableViewButton && href) {
      e.preventDefault();
      setShowButton(true);
    }
  };

  const divProps = enableViewButton
    ? {
        onClick: handleClick,
        onKeyDown: handleKeyDown,
        role: "button" as const,
        tabIndex: 0,
      }
    : {};

  const isFullLink = href && !enableViewButton;
  const isShowLinkText = href && enableViewButton && showButton;

  return (
    <div
      className={twMerge(
        "group relative overflow-hidden border-5 border-white bg-warm-black-25 shadow-md transition-transform duration-400 ease-magnetic hover:scale-[101%] active:scale-[99%]",
        enableViewButton && "hover:cursor-grab active:cursor-grabbing",
        className,
      )}
      style={{ aspectRatio: `${width} / ${height}` }}
      {...divProps}
    >
      {isFullLink && (
        <Link className="focus:outline-none" href={href}>
          {props.alt}
          <span className={"absolute inset-0 z-1"} />
        </Link>
      )}
      {isShowLinkText && (
        <div
          className={twMerge(
            "absolute inset-0 z-1 flex items-center justify-center",
            href && enableViewButton && showButton && "backdrop-blur-xs",
          )}
          ref={linkRef}
        >
          <Link className="w-full py-6 text-center text-warm-white" href={href}>
            この写真を見る
          </Link>
        </div>
      )}
      <Image className="pointer-events-none object-cover transition-all group-hover:brightness-90" fill {...props} />
    </div>
  );
}
