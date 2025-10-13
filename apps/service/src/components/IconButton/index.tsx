import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

type BaseProps = {
  className?: string;
  children: ReactNode;
  title?: string;
};

type ButtonProps = BaseProps & {
  as?: "button";
} & Omit<ComponentProps<"button">, keyof BaseProps>;

type LinkProps = BaseProps & {
  as: "link";
} & Omit<ComponentProps<typeof Link>, keyof BaseProps>;

type Props = ButtonProps | LinkProps;

export default function IconButton({ className, children, title, ...props }: Props) {
  const baseClasses = twMerge(
    "interactive-scale-brightness flex items-center justify-center rounded-full bg-warm-white p-2 transition-all duration-400 ease-magnetic cursor-pointer hover:brightness-90 w-fit",
    className,
  );

  if (props.as === "link") {
    const { as: _as, ...linkProps } = props;

    return (
      <Link className={baseClasses} aria-label={title} {...linkProps}>
        {children}
      </Link>
    );
  }

  const { as: _as, ...buttonProps } = props;

  return (
    <button className={baseClasses} aria-label={title} {...buttonProps}>
      {children}
    </button>
  );
}
