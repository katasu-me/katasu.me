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
    "rounded-xl border border-warm-black bg-warm-white text-sm text-warm-black px-8 py-3 min-w-48 transition-all duration-400 ease-magnetic cursor-pointer hover:bg-warm-black hover:text-warm-white hover:scale-105 hover:shadow-lg active:bg-warm-black active:text-warm-white active:scale-95",
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
