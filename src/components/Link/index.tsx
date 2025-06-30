import type { ReactNode } from "react";

interface LinkProps {
  href: string;
  children: ReactNode;
}

export default function Link({ href, children }: LinkProps) {
  return (
    <a href={href} className="tracking-wide underline transition-all duration-150 ease-in-out hover:opacity-60">
      {children}
    </a>
  );
}
