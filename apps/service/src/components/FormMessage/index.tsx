import { twMerge } from "tailwind-merge";
import IconCircleCheck from "@/assets/icons/circle-check.svg?react";
import IconExclamationCircle from "@/assets/icons/exclamation-circle.svg?react";

type Props = {
  type: "success" | "error";
  text: string;
  caption?: string;
  className?: string;
};

export default function FormMessage({ type, text, caption, className }: Props) {
  const isError = type === "error";

  return (
    <div
      className={twMerge(
        "relative mb-4 flex items-center gap-3 rounded-lg border-2 bg-warm-white px-6 py-4",
        "before:-top-[2px] before:-translate-x-1/2 before:absolute before:left-1/2 before:z-1 before:h-[calc(100%+4px)] before:w-[calc(100%-16px)] before:border-warm-white before:border-y-2 before:content-['']",
        isError ? "border-vivid-red" : "border-warm-green",
        className,
      )}
    >
      {isError ? (
        <IconExclamationCircle className="size-6 text-vivid-red" />
      ) : (
        <IconCircleCheck className="size-6 text-warm-green" />
      )}
      <div className={twMerge("text-sm", isError ? "text-vivid-red" : "text-warm-green")}>
        <p>{text}</p>
        {caption && <p className="mt-0.5 text-xs">{caption}</p>}
      </div>
    </div>
  );
}
