import clsx from "clsx";
import Image from "next/image";
import type { ComponentProps } from "react";
import styles from "./index.module.css";

export default function FrameImage({ className, ...props }: ComponentProps<typeof Image>) {
  return (
    <div className={clsx(styles.frame, className)}>
      {props.title && <div className={styles.title}>{props.title}</div>}
      <Image className={styles.image} {...props} />
    </div>
  );
}
