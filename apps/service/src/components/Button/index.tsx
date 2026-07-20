import { Slot } from "@radix-ui/react-slot";
import type { ComponentPropsWithoutRef } from "react";
import { css, cva, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

type ButtonProps = {
  variant?: "fill" | "outline" | "danger";
  asChild?: boolean;
  cssProps?: SystemStyleObject;
} & Omit<ComponentPropsWithoutRef<"button">, "className">;

const buttonStyles = cva({
  base: {
    rounded: "xl",
    fontSize: "sm",
    lineHeight: "5",
    px: "8",
    py: "3",
    cursor: "pointer",
    transition: "all 400ms token(easings.magnetic)",
    _disabled: {
      shadow: "none",
    },
  },
  variants: {
    variant: {
      fill: {
        bg: "warm-black",
        color: "warm-white",
        _hover: { filter: "brightness(0.9)", shadow: "lg" },
        _active: { filter: "brightness(0.9)" },
        _disabled: {
          bg: "warm-black-50",
          _hover: { filter: "brightness(1)" },
        },
      },
      outline: {
        borderWidth: "1px",
        borderColor: "warm-black",
        bg: "warm-white",
        color: "warm-black",
        _hover: { bg: "warm-black", color: "warm-white", shadow: "lg" },
        _active: { bg: "warm-black", color: "warm-white" },
        _disabled: {
          borderColor: "warm-black-50",
          bg: "warm-white",
          color: "warm-black-50",
          _hover: { bg: "warm-white", color: "warm-black-50" },
        },
      },
      danger: {
        bg: "warm-white",
        borderWidth: "1px",
        borderColor: "red.700",
        color: "red.700",
        _hover: { bg: "red.700", color: "white", shadow: "lg" },
        _active: { filter: "brightness(0.9)" },
        _disabled: {
          bg: "red.300",
          filter: "brightness(0.9)",
          borderColor: "red.300",
          color: "white",
        },
      },
    },
  },
  defaultVariants: {
    variant: "outline",
  },
});

/**
 * Button コンポーネント
 *
 * - asChild = true とすると子要素にボタンのスタイルを適用します。
 */
export default function Button({ variant = "outline", asChild, cssProps, children, ...props }: ButtonProps) {
  const buttonClassName = cx(buttonStyles({ variant }), !props.disabled && "interactive-scale", css(cssProps));

  return asChild ? (
    <Slot className={buttonClassName}>{children}</Slot>
  ) : (
    <button className={buttonClassName} {...props}>
      {children}
    </button>
  );
}
