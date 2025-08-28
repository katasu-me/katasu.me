import Link from "next/link";
import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";
import ChevronLeft from "@/assets/icons/chevron-left.svg";
import ChevronRight from "@/assets/icons/chevron-right.svg";
import CircleFilled from "@/assets/icons/circle-filled.svg";
import CircleOutline from "@/assets/icons/circle-outline.svg";
import Dots from "@/assets/icons/dots.svg";
import IconButton from "@/shared/components/IconButton";

type Props = {
  currentPage: number;
  totalPages: number;
  searchParams: URLSearchParams | Record<string, string>;
  className?: string;
} & Omit<ComponentProps<"nav">, "children">;

const MAX_DOTS = 7;
const EDGE_DOTS = 2;

export default function Pagination({ currentPage, totalPages, searchParams, className, ...props }: Props) {
  const createSearchParams = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    return params.toString();
  };

  const renderDots = () => {
    const dots = [];

    // ページ数が少ない場合は全て表示
    if (totalPages <= MAX_DOTS) {
      for (let i = 1; i <= totalPages; i++) {
        dots.push(i);
      }
      return dots;
    }

    // 現在のページが先頭寄りの場合
    if (currentPage <= EDGE_DOTS + 2) {
      for (let i = 1; i <= EDGE_DOTS + 2; i++) {
        dots.push(i);
      }
      dots.push(-1);
      dots.push(totalPages);
      return dots;
    }

    // 現在のページが末尾寄りの場合
    if (currentPage >= totalPages - (EDGE_DOTS + 1)) {
      dots.push(1);
      dots.push(-1);
      for (let i = totalPages - (EDGE_DOTS + 1); i <= totalPages; i++) {
        dots.push(i);
      }
      return dots;
    }

    // 現在のページが中央の場合
    dots.push(1);
    dots.push(-1);
    dots.push(currentPage - 1);
    dots.push(currentPage);
    dots.push(currentPage + 1);
    dots.push(-1);
    dots.push(totalPages);
    return dots;
  };

  const dots = renderDots();
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <nav
      aria-label="ページネーション"
      className={twMerge("flex items-center justify-center gap-4", className)}
      {...props}
    >
      {!isFirstPage && (
        <IconButton
          as="link"
          href={{
            search: createSearchParams(currentPage - 1),
          }}
          title="前のページへ"
        >
          <ChevronLeft className="h-5 w-5" />
        </IconButton>
      )}

      <div className="flex items-center gap-2">
        {dots.map((dot, index) => {
          if (dot === -1) {
            return <Dots key={`ellipsis-${index.toString()}`} className="h-3 w-3 text-warm-black" aria-hidden="true" />;
          }

          const isCurrent = dot === currentPage;

          return (
            <Link
              key={dot}
              href={{
                search: createSearchParams(dot),
              }}
              aria-label={`ページ${dot}へ`}
              aria-current={isCurrent ? "page" : undefined}
              className="interactive-scale-brightness group text-warm-black transition-all duration-400 ease-magnetic hover:brightness-90"
            >
              <CircleOutline className={twMerge("h-2 w-2", isCurrent && "hidden")} />
              <CircleFilled className={twMerge("h-2 w-2", !isCurrent && "hidden")} />
            </Link>
          );
        })}
      </div>

      {!isLastPage && (
        <IconButton
          as="link"
          href={{
            search: createSearchParams(currentPage + 1),
          }}
          title="次のページへ"
        >
          <ChevronRight className="h-5 w-5" />
        </IconButton>
      )}
    </nav>
  );
}
