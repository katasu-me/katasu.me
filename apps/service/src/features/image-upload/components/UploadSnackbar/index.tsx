import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { twMerge } from "tailwind-merge";
import IconCheck from "@/assets/icons/circle-check.svg?react";
import IconLoader from "@/assets/icons/loader-2.svg?react";
import { DEFAULT_TRANSITION } from "@/constants/animation";
import { useUploadOptional } from "../../contexts/UploadContext";

const AUTO_DISMISS_DELAY = 3000;

export default function UploadSnackbar() {
  const upload = useUploadOptional();

  // 成功時に自動で閉じる
  useEffect(() => {
    if (upload?.state.status !== "success") {
      return;
    }

    const timer = setTimeout(() => {
      upload.reset();
    }, AUTO_DISMISS_DELAY);

    return () => clearTimeout(timer);
  }, [upload?.state.status, upload?.reset]);

  if (!upload) {
    return null;
  }

  const { state, isDrawerOpen } = upload;
  const isVisible = (state.status === "uploading" || state.status === "success") && !isDrawerOpen;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={twMerge(
            "fixed right-4 bottom-4 z-50 flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg",
            state.status === "uploading" && "bg-warm-black text-warm-white",
            state.status === "success" && "bg-green-600 text-white",
          )}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={DEFAULT_TRANSITION}
        >
          {state.status === "uploading" && (
            <>
              <IconLoader className="h-5 w-5 animate-spin" />
              <span className="text-sm tracking-wider">アップロード中…</span>
            </>
          )}
          {state.status === "success" && (
            <>
              <IconCheck className="h-5 w-5" />
              <span className="text-sm tracking-wider">投稿しました</span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
