"use client";

import Image from "next/image";
import Link from "next/link";
import { type ComponentProps, useRef, useState } from "react";
import { useClickAway } from "react-use";
import { twMerge } from "tailwind-merge";

interface FrameImageProps extends Omit<ComponentProps<typeof Image>, "width" | "height"> {
  width: number;
  height: number;
  href?: string;
  enableViewButton?: boolean;
  maxSize?: {
    width: number;
    height: number;
  };
}

export default function FrameImage({
  className,
  width,
  height,
  href,
  enableViewButton = false,
  maxSize,
  ...props
}: FrameImageProps) {
  const [showButton, setShowButton] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  useClickAway(buttonRef, () => {
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

  // サイズを制限しつつアスペクト比を維持
  const aspectRatio = width / height;
  let displayWidth = width;
  let displayHeight = height;

  if (maxSize) {
    // 最大幅を超える場合
    if (displayWidth > maxSize.width) {
      displayWidth = maxSize.width;
      displayHeight = displayWidth / aspectRatio;
    }

    // 最大高さを超える場合
    if (displayHeight > maxSize.height) {
      displayHeight = maxSize.height;
      displayWidth = displayHeight * aspectRatio;
    }
  }

  const divProps = enableViewButton
    ? {
        onClick: handleClick,
        onKeyDown: handleKeyDown,
        role: "button" as const,
        tabIndex: 0,
      }
    : {};

  return (
    <div
      className={twMerge(
        "relative overflow-hidden border-5 border-white bg-warm-black-25 shadow-md",
        href &&
          !enableViewButton &&
          "group transition-transform duration-400 ease-magnetic hover:scale-[101%] active:scale-[99%]",
        enableViewButton && "hover:cursor-grab active:cursor-grabbing",
        className,
      )}
      style={{
        ...(maxSize && {
          maxWidth: maxSize.width,
          maxHeight: maxSize.height,
        }),
        aspectRatio: `${width} / ${height}`,
      }}
      {...divProps}
    >
      {href && !enableViewButton && (
        <Link className="focus:outline-none" href={href}>
          {props.alt}
          <span className="absolute inset-0 z-1" />
        </Link>
      )}
      <Image className="pointer-events-none object-cover transition-all group-hover:brightness-90" fill {...props} />
      {enableViewButton && showButton && href && (
        <div ref={buttonRef} className="absolute inset-x-0 bottom-4 z-10 flex justify-center">
          <Link
            href={href}
            className="rounded-md bg-warm-black-900 px-4 py-2 text-white shadow-lg transition-all duration-400 ease-magnetic hover:brightness-90"
            onClick={(e) => e.stopPropagation()}
          >
            この写真を見る
          </Link>
        </div>
      )}
    </div>
  );
}
