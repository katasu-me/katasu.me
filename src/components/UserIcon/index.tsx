import clsx from "clsx";
import Image from "next/image";
import type { PropsWithChildren } from "react";
import styles from "./index.module.css";

type UserIconProps = PropsWithChildren<{
  src: string;
  alt: string;
  className?: string;
}>;

/**
 * UserIcon コンポーネント
 *
 * ユーザーのアイコン画像を表示します。
 */
export default function UserIcon({ src, alt, className, children }: UserIconProps) {
  return (
    <div className={clsx(styles.userIcon, className)}>
      <div className={styles.icon}>
        <Image src={src} alt={alt} fill />
      </div>
      <span className={styles.name}>{children}</span>
    </div>
  );
}
