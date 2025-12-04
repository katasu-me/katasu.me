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
        "relative mb-4 flex items-center gap-3 bg-warm-white px-6 py-4",
        "before:absolute before:top-0 before:left-0 before:h-full before:w-2 before:rounded-l-lg before:border-2 before:border-r-0 before:content-['']",
        "after:absolute after:top-0 after:right-0 after:h-full after:w-2 after:rounded-r-lg after:border-2 after:border-l-0 after:content-['']",
        isError ? "before:border-vivid-red after:border-vivid-red" : "before:border-warm-green after:border-warm-green",
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
