import { twMerge } from "tailwind-merge";
import IconPhotoPlus from "@/assets/icons/photo-plus.svg";

type Props = {
  title: string;
  className?: string;
};

export default function ImageDropArea({ title, className }: Props) {
  return (
    <div
      className={twMerge(
        "flex items-center justify-center rounded-xl border border-warm-black-50 border-dashed bg-warm-white transition-filter duration-400 ease-magnetic hover:brightness-90",
        className,
      )}
    >
      <div className="flex items-center gap-2 text-sm tracking-wider">
        <IconPhotoPlus className="h-5 w-5" />
        <p>{title}</p>
      </div>
    </div>
  );
}
