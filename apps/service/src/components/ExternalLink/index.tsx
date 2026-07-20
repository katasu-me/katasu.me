import type { ComponentProps } from "react";
import { css, cx } from "styled-system/css";

export default function ExternalLink({ className, children, ...props }: ComponentProps<"a">) {
  return (
    <a
      {...props}
      className={cx(
        css({
          letterSpacing: "wide",
          transition: "all 400ms token(easings.magnetic)",
          _hover: { textDecoration: "underline" },
        }),
        className,
      )}
      target="_blank"
      rel="noopener"
    >
      {children}
    </a>
  );
}
