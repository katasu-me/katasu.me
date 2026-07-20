import { motion } from "motion/react";
import type { ComponentProps } from "react";
import { css } from "styled-system/css";
import FrameImage from "@/components/FrameImage";

type Props = Omit<ComponentProps<typeof FrameImage>, "cssProps" | "disableHoverEffect">;

export default function BigImage(props: Props) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 1.025,
        filter: "blur(8px)",
      }}
      animate={{
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
      }}
      transition={{
        type: "spring",
        mass: 5,
        stiffness: 550,
        damping: 100,
      }}
    >
      <FrameImage
        {...props}
        cssProps={css.raw({ mx: "auto", w: "full", h: "auto", pc: { maxH: "70vh", w: "unset" } })}
        disableHoverEffect
        linkParams={undefined}
      />
    </motion.div>
  );
}
