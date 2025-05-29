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
  const mergedClassName = twMerge(
    "rounded-xl border border-warm-black bg-warm-white text-warm-black px-8 min-w-48 py-3",
    "hover:bg-warm-black hover:text-warm-white hover:cursor-pointer hover:scale-105 focus:bg-warm-black focus:text-warm-white focus:scale-105",
    "active:bg-warm-black active:text-warm-white active:scale-95 active:shadow-inner",
    "transition-colors transition-transform ease-magnetic duration-300",
    className,
  );

  return asChild ? (
    <Slot className={mergedClassName}>{children}</Slot>
  ) : (
    <button className={mergedClassName} {...props}>
      {children}
    </button>
  );
}
