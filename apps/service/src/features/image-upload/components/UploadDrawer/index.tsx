import { useState } from "react";
import Button from "@/components/Button";
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

  const isUploadLimited = counter && counter.total >= counter.max;

  return (
    <Drawer
      title={
        <>
          <span>{isUploadLimited ? "投稿できません" : "投稿する"}</span>
          {counter && <FilmCounter total={counter.total} max={counter.max} />}
        </>
      }
      titleClassname="flex items-center justify-between"
      open={isDrawerOpen}
      onOpenChange={handleOpenChange}
      dismissible={!isPending && state.status !== "uploading"}
    >
      {({ Description, Close }) => {
        if (isUploadLimited) {
          return (
            <>
              <Description className="mb-6 text-sm text-warm-black">
                投稿できる画像の上限（{counter.max}枚）に達しています。 不要な画像を削除してから、再度お試しください。
              </Description>
              <Close asChild>
                <Button className="w-full" variant="fill">
                  閉じる
                </Button>
              </Close>
            </>
          );
        }

        return (
          <>
            <Description hidden>新しい画像を投稿するフォーム</Description>
            <UploadForm
              defaultImageFile={formData?.file.size ? formData.file : undefined}
              defaultTags={formData?.tags}
              defaultTitle={formData?.title}
              onPendingChange={setIsPending}
            />
          </>
        );
      }}
    </Drawer>
  );
}
