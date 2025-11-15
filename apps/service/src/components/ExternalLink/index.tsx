import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export default function ExternalLink({ className, children, ...props }: ComponentProps<"a">) {
  return (
    <a
      {...props}
      className={twMerge("tracking-wide transition-all duration-400 ease-magnetic hover:underline", className)}
      target="_blank"
      rel="noopener"
    >
      {children}
    </a>
  );
}
