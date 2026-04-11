import type { Variants } from "motion/react";
import { motion } from "motion/react";
import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

type LoaderIconProps = {
  size?: number;
} & ComponentProps<"div">;

const G_VARIANTS: Variants = {
  animate: {
    rotate: 360,
    transition: {
      repeat: Number.POSITIVE_INFINITY,
      duration: 0.8,
      ease: "linear",
    },
  },
};

export default function LoaderIcon({ className, size = 28, ...props }: LoaderIconProps) {
  return (
    <div className={twMerge(className)} {...props}>
      <svg
        fill="none"
        height={size}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width={size}
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.g animate="animate" style={{ transformOrigin: "12px 12px" }} variants={G_VARIANTS}>
          <path d="M12 2v4" />
          <path d="m16.2 7.8 2.9-2.9" />
          <path d="M18 12h4" />
          <path d="m16.2 16.2 2.9 2.9" />
          <path d="M12 18v4" />
          <path d="m4.9 19.1 2.9-2.9" />
          <path d="M2 12h4" />
          <path d="m4.9 4.9 2.9 2.9" />
        </motion.g>
      </svg>
    </div>
  );
}
