import type { ReactNode } from "react";
import styles from "./index.module.css";

interface LinkProps {
  href: string;
  children: ReactNode;
}

export default function Link({ href, children }: LinkProps) {
  return (
    <a href={href} className={styles.link}>
      {children}
    </a>
  );
}
