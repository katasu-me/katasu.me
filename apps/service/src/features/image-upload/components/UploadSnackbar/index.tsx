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

  return <SnackbarContent status={upload?.state.status} />;
}
