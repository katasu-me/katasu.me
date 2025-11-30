import { type DragEvent, useState } from "react";
import { twMerge } from "tailwind-merge";
import IconImagePlus from "@/assets/icons/image-plus.svg?react";
import { useUpload } from "../../contexts/UploadContext";

const MAX_FILE_COUNT = 1;

type Props = {
  title: string;
  counter: {
    total: number;
    max: number;
  };
  defaultTags?: string[];
  className?: string;
};

export default function ImageDropArea({ title, counter, defaultTags, className }: Props) {
  const { state, openDrawer } = useUpload();
  const [isDragging, setIsDragging] = useState(false);

  const isUploading = state.status === "uploading";

  const handleDragEnter = (e: DragEvent<HTMLButtonElement>) => {
    if (isUploading) {
      return;
    }

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

    if (isUploading) {
      return;
    }

    if (e.dataTransfer.files !== null && e.dataTransfer.files.length > 0) {
      if (e.dataTransfer.files.length !== MAX_FILE_COUNT) {
        alert(`画像は${MAX_FILE_COUNT}個まで選択できます`);
        return;
      }

      openDrawer({
        defaultFile: e.dataTransfer.files[0],
        defaultTags,
        counter,
      });
    }
  };

  const handleClick = () => {
    if (isUploading) {
      return;
    }

    openDrawer({ defaultTags, counter });
  };

  return (
    <button
      className={twMerge(
        "interactive-scale-sm flex w-full items-center justify-center gap-8 rounded-xl border-2 border-warm-black-50 border-dashed bg-warm-white py-6 hover:brightness-90",
        isDragging && "scale-[101%] brightness-90",
        isUploading && "cursor-not-allowed opacity-50",
        className,
      )}
      onClick={handleClick}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      type="button"
      disabled={isUploading}
    >
      <div className="flex items-center gap-2 text-sm tracking-wider">
        <IconImagePlus className="h-4 w-4" />
        <p>{isDragging ? "ドラッグ&ドロップしてアップロード" : title}</p>
      </div>
    </button>
  );
}
