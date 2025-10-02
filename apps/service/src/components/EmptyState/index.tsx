import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";
import IconPlant from "@/assets/icons/plant.svg";

type Props = {
  message: string;
  className?: string;
} & Omit<ComponentProps<"div">, "children">;

export default function EmptyState({ message, className, ...props }: Props) {
  return (
    <div
      className={twMerge(
        "flex flex-col items-center justify-center gap-2 py-24 text-center text-warm-black-50",
        className,
      )}
      {...props}
    >
      <IconPlant className="size-10" />
      <p className="text-base">{message}</p>
    </div>
  );
}
