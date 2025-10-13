"use client";

import { type ComponentProps, type DragEvent, useState } from "react";
import { twMerge } from "tailwind-merge";
import IconImagePlus from "@/assets/icons/image-plus.svg";
import UploadDrawer from "../UploadDrawer";

const MAX_FILE_COUNT = 1;

type Props = {
  title: string;

  defaultTags?: string[];
  className?: string;
} & Pick<ComponentProps<typeof UploadDrawer>, "counter">;

export default function ImageDropArea({ title, counter, defaultTags, className }: Props) {
  const [open, setOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [defaultImageFile, setDefaultImageFile] = useState<File | undefined>();

  const handleDragEnter = (e: DragEvent<HTMLButtonElement>) => {
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (_e: DragEvent<HTMLButtonElement>) => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLButtonElement>) => {
    e.preventDefault();

    setIsDragging(false);

    if (e.dataTransfer.files !== null && e.dataTransfer.files.length > 0) {
      if (e.dataTransfer.files.length !== MAX_FILE_COUNT) {
        alert(`画像は${MAX_FILE_COUNT}個まで選択できます`);
        return;
      }

      setDefaultImageFile(e.dataTransfer.files[0]);
      setOpen(true);
    }
  };

  const handleOpenChange = (state: boolean) => {
    setOpen(state);

    if (!state) {
      setDefaultImageFile(undefined);
    }
  };

  const handleSuccess = () => {
    setOpen(false);
    setDefaultImageFile(undefined);
  };

  return (
    <>
      <button
        className={twMerge(
          "interactive-scale-sm flex w-full items-center justify-center gap-8 rounded-xl border-2 border-warm-black-50 border-dashed bg-warm-white py-6 hover:brightness-90",
          isDragging && "scale-[101%] brightness-90",
          className,
        )}
        onClick={() => setOpen(true)}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        type="button"
      >
        <div className="flex items-center gap-2 text-sm tracking-wider">
          <IconImagePlus className="h-4 w-4" />
          <p>{isDragging ? "ドラッグ&ドロップしてアップロード" : title}</p>
        </div>
      </button>

      <UploadDrawer
        counter={counter}
        open={open}
        onOpenChange={handleOpenChange}
        onSuccess={handleSuccess}
        defaultImageFile={defaultImageFile}
        defaultTags={defaultTags}
      />
    </>
  );
}
