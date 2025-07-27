"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  className?: string;
} & Omit<ComponentProps<"nav">, "children">;

const MAX_DOTS = 7;
const EDGE_DOTS = 2;

export default function Pagination({ currentPage, totalPages, className, ...props }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    return `${pathname}?${params.toString()}`;
  };

  const renderDots = () => {
    const dots = [];

    if (totalPages <= MAX_DOTS) {
      for (let i = 1; i <= totalPages; i++) {
        dots.push(i);
      }
    } else {
      if (currentPage <= EDGE_DOTS + 2) {
        for (let i = 1; i <= EDGE_DOTS + 2; i++) {
          dots.push(i);
        }
        dots.push(-1);
        dots.push(totalPages);
      } else if (currentPage >= totalPages - (EDGE_DOTS + 1)) {
        dots.push(1);
        dots.push(-1);
        for (let i = totalPages - (EDGE_DOTS + 1); i <= totalPages; i++) {
          dots.push(i);
        }
      } else {
        dots.push(1);
        dots.push(-1);
        dots.push(currentPage - 1);
        dots.push(currentPage);
        dots.push(currentPage + 1);
        dots.push(-1);
        dots.push(totalPages);
      }
    }

    return dots;
  };

  const dots = renderDots();

  return (
    <nav
      aria-label="ページネーション"
      className={twMerge("flex items-center justify-center gap-2", className)}
      {...props}
    >
      <div className="flex items-center gap-2">
        {dots.map((dot, index) => {
          if (dot === -1) {
            return (
              <span key={`ellipsis-${index.toString()}`} className="text-gray-400">
                …
              </span>
            );
          }

          const isCurrent = dot === currentPage;

          return (
            <Link
              key={dot}
              href={createPageUrl(dot)}
              aria-label={`ページ${dot}へ`}
              aria-current={isCurrent ? "page" : undefined}
              className={twMerge(
                "block h-2 w-2 rounded-full transition-all duration-400 ease-magnetic",
                isCurrent ? "bg-gray-700" : "border border-gray-400 bg-white hover:brightness-90",
              )}
            />
          );
        })}
      </div>
    </nav>
  );
}
