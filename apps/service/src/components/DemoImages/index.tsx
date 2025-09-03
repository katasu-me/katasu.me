"use client";

import type { MotionProps, TargetAndTransition, Transition } from "motion/react";
import { motion } from "motion/react";
import { twMerge } from "tailwind-merge";
import ImageDemo1 from "@/assets/images/top/demo_1.webp";
import ImageDemo2 from "@/assets/images/top/demo_2.webp";
import ImageDemo3 from "@/assets/images/top/demo_3.webp";

type DemoImage = {
  src: string;
  alt: string;
  animation: {
    initial: TargetAndTransition;
    whileInView: TargetAndTransition;
    transition?: Transition;
    viewport?: MotionProps["viewport"];
  };
};

const DemoImageData: DemoImage[] = [
  {
    src: ImageDemo1.src,
    alt: "建物間に吊り下げられた色とりどりの傘のインスタレーション。黄色、オレンジ、紫、青、ピンクなど様々な色の傘が空中に浮かび、青空を背景に鮮やかな天蓋を作り出している",
    animation: {
      initial: {
        y: 20,
        rotate: "-4deg",
        opacity: 0,
      },
      whileInView: {
        y: 0,
        rotate: "0deg",
        opacity: 1,
      },
      transition: {
        duration: 0.8,
        delay: 0.6,
        ease: "backOut",
      },
    },
  },
  {
    src: ImageDemo2.src,
    alt: "格子状のガラス天井やトップライトを下から見上げた抽象的な建築写真。青空と雲が見え、プリズム効果による光の屈折が表現されている",
    animation: {
      initial: {
        y: 20,
        rotate: "4deg",
        opacity: 0,
      },
      whileInView: {
        x: -24,
        y: -16,
        rotate: "-4deg",
        opacity: 1,
      },
      transition: {
        duration: 0.8,
        delay: 0.3,
      },
    },
  },
  {
    src: ImageDemo3.src,
    alt: "遠くの山々に向かって続く田舎道を撮影した雰囲気のあるフィルム写真。曇り空の下、柔らかい焦点と落ち着いた色調で表現されている",
    animation: {
      initial: {
        y: 20,
        opacity: 0,
      },
      whileInView: {
        opacity: 1,
        rotate: "6deg",
        x: 20,
        y: 12,
      },
      transition: {
        duration: 0.8,
        delay: 0,
      },
    },
  },
];

type Props = {
  className?: string;
};

export default function DemoImages({ className }: Props) {
  return (
    <div className={twMerge("relative h-[160px] w-64", className)}>
      {DemoImageData.slice()
        .reverse()
        .map((image) => {
          return (
            // biome-ignore lint/performance/noImgElement: アニメーションのため
            <motion.img
              key={image.src}
              src={image.src}
              alt={image.alt}
              className="absolute top-0 left-0 w-64 border-4 border-white shadow-[0_0_8px_rgba(0,0,0,0.1)]"
              initial={image.animation.initial}
              whileInView={image.animation.whileInView}
              viewport={{ once: true }}
              transition={image.animation.transition}
            />
          );
        })}
    </div>
  );
}
