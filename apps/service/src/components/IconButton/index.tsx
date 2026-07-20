import { Slot } from "@radix-ui/react-slot";
import type { ComponentPropsWithoutRef } from "react";
import { css, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

type Props = {
  asChild?: boolean;
  cssProps?: SystemStyleObject;
} & Omit<ComponentPropsWithoutRef<"button">, "className">;

export default function IconButton({ children, asChild, cssProps, ...props }: Props) {
  const baseClassName = cx(
    "interactive-scale-brightness",
    css(
      {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        w: "fit",
        rounded: "full",
        bg: "warm-white",
        p: "2",
        cursor: "pointer",
        transition: "all 400ms token(easings.magnetic)",
        _hover: {
          filter: "brightness(0.9)",
        },
      },
      cssProps,
    ),
  );

  return asChild ? (
    <Slot className={baseClassName}>{children}</Slot>
  ) : (
    <button className={baseClassName} {...props}>
      {children}
    </button>
  );
}
