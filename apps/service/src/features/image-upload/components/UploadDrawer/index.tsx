import { useState } from "react";
import Drawer from "@/components/Drawer";
import { useUpload } from "../../contexts/UploadContext";
import UploadForm from "../UploadForm";
import FilmCounter from "./FilmCounter";

export default function UploadDrawer() {
  const { state, formData, counter, isDrawerOpen, closeDrawer } = useUpload();
  const [isPending, setIsPending] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeDrawer();
    }
  };

  return (
    <Drawer
      title={
        <>
          <span>投稿する</span>
          {counter && <FilmCounter total={counter.total} max={counter.max} />}
        </>
      }
      titleClassname="flex items-center justify-between"
      open={isDrawerOpen}
      onOpenChange={handleOpenChange}
      dismissible={!isPending && state.status !== "uploading"}
    >
      {({ Description }) => (
        <>
          <Description hidden>新しい画像を投稿するフォーム</Description>
          <UploadForm
            defaultImageFile={formData?.file.size ? formData.file : undefined}
            defaultTags={formData?.tags}
            defaultTitle={formData?.title}
            onPendingChange={setIsPending}
          />
        </>
      )}
    </Drawer>
  );
}
