import { motion } from "motion/react";
import type { ComponentProps } from "react";
import FrameImage from "@/components/FrameImage";

type Props = Omit<ComponentProps<typeof FrameImage>, "className" | "disableHoverEffect">;

export default function BigImage(props: Props) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.95,
        rotate: 4,
        filter: "blur(8px)",
      }}
      animate={{
        opacity: 1,
        scale: 1,
        rotate: 0,
        filter: "blur(0px)",
      }}
      transition={{
        type: "spring",
        mass: 5,
        stiffness: 550,
        damping: 60,
      }}
    >
      <FrameImage
        {...props}
        className="mx-auto h-auto pc:max-h-[70vh] pc:w-[unset] w-full"
        disableHoverEffect
        linkParams={undefined} // リンクである必要がないので
      />
    </motion.div>
  );
}
