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
        "mb-4 flex items-center gap-2 rounded-xl border bg-warm-white p-4",
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
        <p className="font-bold">{text}</p>
        {caption && <p className="mt-0.5 text-xs">{caption}</p>}
      </div>
    </div>
  );
}
