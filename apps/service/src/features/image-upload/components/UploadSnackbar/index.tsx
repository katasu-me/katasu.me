import { useEffect } from "react";
import { useUploadOptional } from "../../contexts/UploadContext";
import SnackbarContent from "./SnackbarContent";

const AUTO_DISMISS_DELAY = 3000;

export default function UploadSnackbar() {
  const upload = useUploadOptional();

  // 成功時に閉じる
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

  if (state.status !== "uploading" && state.status !== "success") {
    return null;
  }

  return <SnackbarContent status={state.status} isVisible={isVisible} />;
}
