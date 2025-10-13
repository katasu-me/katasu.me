import { twMerge } from "tailwind-merge";
import IconExclamationCircle from "@/assets/icons/exclamation-circle.svg";

type Props = {
  text: string;
  className?: string;
};

export default function FormErrorMessage({ text, className }: Props) {
  return (
    <div className={twMerge("mb-4 flex items-center gap-2 rounded-lg border border-red-600 bg-red-50 p-4", className)}>
      <IconExclamationCircle className="size-6 text-red-600" />
      <p className="text-red-600 text-sm">{text}</p>
    </div>
  );
}
