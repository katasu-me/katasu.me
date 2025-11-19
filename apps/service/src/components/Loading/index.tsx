import { twMerge } from "tailwind-merge";
import animationEmojiPlant from "@/assets/animation-emoji/512.gif?url";

type Props = {
  title?: string;
  className?: string;
};

export function Loading({ title, className }: Props) {
  return (
    <div className={twMerge("flex h-full flex-col items-center", className)}>
      <img className="size-20" src={animationEmojiPlant} alt="生えてくる双葉" />
      <p className="mt-3 text-sm tracking-wider">{title || "ちょっとまってね"}</p>
    </div>
  );
}
