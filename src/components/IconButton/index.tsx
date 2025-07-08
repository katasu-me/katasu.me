import { twMerge } from "tailwind-merge";
import IconDots from "@/assets/icons/dots.svg";
import IconFlag from "@/assets/icons/flag.svg";
import IconSearch from "@/assets/icons/search.svg";
import IconSettings from "@/assets/icons/settings.svg";

const ICONS = {
  search: {
    Icon: IconSearch,
    title: "検索",
  },
  settings: {
    Icon: IconSettings,
    title: "設定",
  },
  flag: {
    Icon: IconFlag,
    title: "通報",
  },
  dots: {
    Icon: IconDots,
    title: "その他",
  },
} as const;

type Props = {
  iconName: keyof typeof ICONS;
  className?: string;
};

export default function IconButton({ iconName, className }: Props) {
  const icon = ICONS[iconName];

  return (
    <button
      className={twMerge(
        "flex items-center justify-center rounded-full bg-warm-white p-2 transition-all duration-400 ease-magnetic hover:scale-105 hover:brightness-90 active:scale-95",
        className,
      )}
      title={icon.title}
    >
      <icon.Icon className="h-6 w-6" />
    </button>
  );
}
