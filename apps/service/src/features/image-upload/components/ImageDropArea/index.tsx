import { twMerge } from "tailwind-merge";
import IconImagePlus from "@/assets/icons/image-plus.svg?react";
import { useUpload } from "../../contexts/UploadContext";

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

  const isUploading = state.status === "uploading";
  const isUploadLimited = counter.total >= counter.max;

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
        isUploading && "cursor-not-allowed opacity-50",
        className,
      )}
      onClick={handleClick}
      type="button"
      disabled={isUploading}
    >
      <div className="flex items-center gap-2 text-sm tracking-wider">
        <IconImagePlus className="h-4 w-4" />
        <p>{isUploadLimited ? "投稿できる画像の上限に達しました 🥺" : title}</p>
      </div>
    </button>
  );
}
