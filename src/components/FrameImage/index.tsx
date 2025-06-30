import clsx from "clsx";
import Image from "next/image";
import type { ComponentProps } from "react";
import styles from "./index.module.css";

interface FrameImageProps extends Omit<ComponentProps<typeof Image>, "width" | "height"> {
  width: number;
  height: number;
}

export default function FrameImage({ className, width, height, ...props }: FrameImageProps) {
  return (
    <div className={clsx(styles.frame, className)} style={{ aspectRatio: `${width} / ${height}` }}>
      {props.title && <div className={styles.title}>{props.title}</div>}
      <Image className={styles.image} fill {...props} />
    </div>
  );
}
