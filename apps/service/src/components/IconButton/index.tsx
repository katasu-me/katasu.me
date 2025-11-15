import { Slot } from "@radix-ui/react-slot";
import type { ComponentPropsWithoutRef } from "react";
import { twMerge } from "tailwind-merge";

type Props = {
  asChild?: boolean;
} & ComponentPropsWithoutRef<"button">;

export default function IconButton({ className, children, asChild, ...props }: Props) {
  const baseClasses = twMerge(
    "interactive-scale-brightness flex items-center justify-center rounded-full bg-warm-white p-2 transition-all duration-400 ease-magnetic cursor-pointer hover:brightness-90 w-fit",
    className,
  );

  return asChild ? (
    <Slot className={baseClasses}>{children}</Slot>
  ) : (
    <button className={baseClasses} {...props}>
      {children}
    </button>
  );
}
