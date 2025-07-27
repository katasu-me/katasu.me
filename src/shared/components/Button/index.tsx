import { Slot } from "@radix-ui/react-slot";
import type { ComponentPropsWithoutRef } from "react";
import { twMerge } from "tailwind-merge";

type ButtonProps = {
  asChild?: boolean;
} & ComponentPropsWithoutRef<"button">;

/**
 * Button コンポーネント
 *
 * - asChild = true とすると子要素にボタンのスタイルを適用します。
 */
export default function Button({ asChild, className, children, ...props }: ButtonProps) {
  const buttonClassName = twMerge(
    "interactive-scale rounded-xl border border-warm-black bg-warm-white text-sm text-warm-black px-8 py-3 cursor-pointer hover:bg-warm-black hover:text-warm-white hover:shadow-lg active:bg-warm-black active:text-warm-white",
    className,
  );

  return asChild ? (
    <Slot className={buttonClassName}>{children}</Slot>
  ) : (
    <button className={buttonClassName} {...props}>
      {children}
    </button>
  );
}
