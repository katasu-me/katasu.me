import Link, { type LinkProps } from "next/link";
import type { PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";

type Props = {
  className?: string;
} & PropsWithChildren<LinkProps>;

export default function TextLink({ className, children, ...props }: Props) {
  return (
    <Link
      {...props}
      className={twMerge("tracking-wide transition-all duration-400 ease-magnetic hover:underline", className)}
    >
      {children}
    </Link>
  );
}
