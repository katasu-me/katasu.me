import IconFlag from "@/assets/icons/flag.svg";
import IconSearch from "@/assets/icons/search.svg";
import IconSettings from "@/assets/icons/settings.svg";
import clsx from "clsx";
import styles from "./index.module.css";

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
} as const;

type Props = {
  iconName: keyof typeof ICONS;
  className?: string;
};

export default function IconButton({ iconName, className }: Props) {
  const icon = ICONS[iconName];

  return (
    <button className={clsx(styles.button, className)} title={icon.title}>
      <icon.Icon size={undefined} />
    </button>
  );
}
