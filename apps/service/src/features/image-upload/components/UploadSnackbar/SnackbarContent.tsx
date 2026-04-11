import { AnimatePresence, motion } from "motion/react";
import IconCheck from "@/assets/icons/circle-check.svg?react";
import LoaderIcon from "@/components/Icon/LucideAnimated/LoaderIcon";
import { DEFAULT_TRANSITION } from "@/constants/animation";
import type { UploadStatus } from "../../contexts/UploadContext";

type Props = {
  status: UploadStatus | undefined;
};

export default function SnackbarContent({ status }: Props) {
  const isVisible = status === "uploading" || status === "success";

  return (
    <AnimatePresence>
      {isVisible && status && (
        <motion.div
          className="sticky top-0 z-floating col-span-full flex items-center justify-center gap-3 rounded-b-xl border-warm-white border-b-2 bg-warm-black text-warm-white"
          initial={{
            opacity: 0,
            height: 0,
            y: -20,
            scale: 0.95,
          }}
          animate={{
            opacity: 1,
            height: "3rem",
            y: 0,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            height: 0,
            y: -20,
            scale: 0.95,
          }}
          transition={DEFAULT_TRANSITION}
        >
          {status === "uploading" && (
            <>
              <LoaderIcon className="h-5 w-5" size={20} />
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
