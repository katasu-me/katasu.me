"use client";

import { type DragEvent, useState } from "react";
import { twMerge } from "tailwind-merge";
import IconPhotoPlus from "@/assets/icons/photo-plus.svg";
import ImageDrawer from "../ImageDrawer";

type Props = {
  title: string;
  className?: string;
};

export default function ImageDropArea({ title, className }: Props) {
  const [open, setOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const onDragEnter = (e: DragEvent<HTMLButtonElement>) => {
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      console.log("onDragEnter", e.dataTransfer.items);
      setIsDragging(true);
    }
  };

  const onDragLeave = (e: DragEvent<HTMLButtonElement>) => {
    console.log("onDragLeave", e);
    setIsDragging(false);
  };

  const onDrop = (e: DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files !== null && e.dataTransfer.files.length > 0) {
      if (e.dataTransfer.files.length === 1) {
        console.log("onDrop", e.dataTransfer.files);
      } else {
        alert("ファイルは１個まで選択可能です");
      }

      e.dataTransfer.clearData();
    }
  };

  return (
    <>
      <button
        className={twMerge(
          "interactive-scale-sm flex w-full items-center justify-center rounded-xl border border-warm-black-50 border-dashed bg-warm-white py-6 hover:brightness-90",
          isDragging && "scale-[101%] brightness-90",
          className,
        )}
        onClick={() => setOpen(true)}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        type="button"
      >
        <div className="flex items-center gap-2 text-sm tracking-wider">
          <IconPhotoPlus className="h-4 w-4" />
          <p>{isDragging ? "ドラッグ&ドロップしてアップロード" : title}</p>
        </div>
      </button>
      <ImageDrawer open={open} onOpenChange={(state) => setOpen(state)} />
    </>
  );
}
