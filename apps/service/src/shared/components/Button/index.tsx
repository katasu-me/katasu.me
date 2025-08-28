import { Slot } from "@radix-ui/react-slot";
import type { ComponentPropsWithoutRef } from "react";
import { twMerge } from "tailwind-merge";

type ButtonProps = {
  variant?: "fill" | "outline";
  asChild?: boolean;
} & ComponentPropsWithoutRef<"button">;

/**
 * Button コンポーネント
 *
 * - asChild = true とすると子要素にボタンのスタイルを適用します。
 */
export default function Button({ variant = "outline", asChild, className, children, ...props }: ButtonProps) {
  const variantStyles = new Map<ButtonProps["variant"], string>([
    [
      "fill",
      "bg-warm-black text-warm-white hover:brightness-90 hover:shadow-lg active:brightness-90 disabled:bg-warm-black-50 disabled:hover:brightness-100 disabled:shadow-none",
    ],
    [
      "outline",
      "border border-warm-black bg-warm-white text-warm-black hover:bg-warm-black hover:text-warm-white hover:shadow-lg active:bg-warm-black active:text-warm-white disabled:border-warm-black-50 disabled:bg-warm-white disabled:text-warm-black-50 disabled:hover:bg-warm-white disabled:hover:text-warm-black-50 disabled:shadow-none",
    ],
  ]);

  const buttonClassName = twMerge(
    "rounded-xl text-sm px-8 py-3 cursor-pointer transition-all duration-400 ease-magnetic",
    !props.disabled && "interactive-scale",
    variantStyles.get(variant),
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
