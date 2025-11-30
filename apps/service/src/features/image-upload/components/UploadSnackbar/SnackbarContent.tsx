import { AnimatePresence, motion } from "motion/react";
import IconCheck from "@/assets/icons/circle-check.svg?react";
import IconLoader from "@/assets/icons/loader-2.svg?react";
import { DEFAULT_TRANSITION } from "@/constants/animation";

type Props = {
  status: "uploading" | "success";
  isVisible: boolean;
};

export default function SnackbarContent({ status, isVisible }: Props) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed top-4 left-1/2 z-50 flex items-center gap-3 rounded-xl bg-warm-black px-4 py-3 text-warm-white shadow-lg"
          initial={{ opacity: 0, y: -20, scale: 0.95, x: "-50%" }}
          animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
          exit={{ opacity: 0, y: -20, scale: 0.95, x: "-50%" }}
          transition={DEFAULT_TRANSITION}
        >
          {status === "uploading" && (
            <>
              <IconLoader className="h-5 w-5 animate-spin" />
              <span className="text-sm tracking-wider">投稿しています…</span>
            </>
          )}
          {status === "success" && (
            <>
              <IconCheck className="h-5 w-5" />
              <span className="text-sm tracking-wider">投稿しました！</span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
