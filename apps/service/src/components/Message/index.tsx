import type { PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";
import IconExclamationCircle from "@/assets/icons/exclamation-circle.svg";
import IconPlant from "@/assets/icons/plant.svg";

const ICON_LIST = {
  plant: IconPlant,
  error: IconExclamationCircle,
} as const;

type Props = PropsWithChildren<{
  message: string;
  icon?: keyof typeof ICON_LIST;
  className?: string;
}>;

export default function EmptyState({ message, icon = "plant", className, ...props }: Props) {
  const Icon = icon ? ICON_LIST[icon] : IconPlant;

  return (
    <div
      className={twMerge(
        "col-start-2 flex flex-col items-center justify-center gap-2 py-24 text-center text-warm-black-50",
        className,
      )}
      {...props}
    >
      <Icon className="size-10" />
      <p className="text-base">{message}</p>
    </div>
  );
}
