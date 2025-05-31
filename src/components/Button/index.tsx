import { Slot } from "@radix-ui/react-slot";
import type { ComponentPropsWithoutRef } from "react";
import styles from "./index.module.css";

type ButtonProps = {
  asChild?: boolean;
} & ComponentPropsWithoutRef<"button">;

/**
 * Button コンポーネント
 *
 * - asChild = true とすると子要素にボタンのスタイルを適用します。
 */
export default function Button({ asChild, className, children, ...props }: ButtonProps) {
  const buttonClassName = `${styles.button} ${className || ""}`.trim();

  return asChild ? (
    <Slot className={buttonClassName}>{children}</Slot>
  ) : (
    <button className={buttonClassName} {...props}>
      {children}
    </button>
  );
}
