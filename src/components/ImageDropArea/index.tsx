import IconPhotoPlus from "@/assets/icons/photo-plus.svg";
import clsx from "clsx";
import styles from "./index.module.css";

type Props = {
  title: string;
  className?: string;
};

export default function ImageDropArea({ title, className }: Props) {
  return (
    <div className={clsx(styles.dropArea, className)}>
      <div className={styles.title}>
        <IconPhotoPlus className={styles.icon} />
        <p>{title}</p>
      </div>
    </div>
  );
}
