import Link from "next/link";
import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";
import ChevronLeft from "@/assets/icons/chevron-left.svg";
import ChevronRight from "@/assets/icons/chevron-right.svg";
import IconButton from "@/components/IconButton";

type Props = {
  currentPage: number;
  totalPages: number;
  searchParams: URLSearchParams | Record<string, string>;
  className?: string;
} & Omit<ComponentProps<"nav">, "children">;

export default function Pagination({ currentPage, totalPages, searchParams, className, ...props }: Props) {
  const createSearchParams = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    return params.toString();
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];

    // 先頭ページ
    const isFirstCurrent = currentPage === 1;
    pageNumbers.push(
      <Link
        key={1}
        href={{
          search: createSearchParams(1),
        }}
        aria-label="ページ1へ"
        aria-current={isFirstCurrent ? "page" : undefined}
        className={twMerge(
          "rounded-md border border-gray-300 px-3 py-2 transition-all duration-400 ease-magnetic",
          isFirstCurrent ? "bg-warm-black text-white" : "bg-white text-warm-black hover:brightness-90",
        )}
      >
        1
      </Link>,
    );

    // 省略記号（必要な場合）
    if (currentPage > 3) {
      pageNumbers.push(
        <span key="ellipsis1" className="px-3 py-2 text-warm-black" aria-hidden="true">
          ...
        </span>,
      );
    }

    // n-1ページ（現在のページが2以上の場合）
    if (currentPage > 2) {
      pageNumbers.push(
        <Link
          key={currentPage - 1}
          href={{
            search: createSearchParams(currentPage - 1),
          }}
          aria-label={`ページ${currentPage - 1}へ`}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-warm-black transition-all duration-400 ease-magnetic hover:brightness-90"
        >
          {currentPage - 1}
        </Link>,
      );
    }

    // 現在のページ（先頭と末尾でない場合）
    if (currentPage !== 1 && currentPage !== totalPages) {
      pageNumbers.push(
        <span
          key={currentPage}
          aria-current="page"
          className="rounded-md border border-gray-300 bg-warm-black px-3 py-2 text-white"
        >
          {currentPage}
        </span>,
      );
    }

    // n+1ページ（現在のページが末尾でない場合）
    if (currentPage < totalPages - 1) {
      pageNumbers.push(
        <Link
          key={currentPage + 1}
          href={{
            search: createSearchParams(currentPage + 1),
          }}
          aria-label={`ページ${currentPage + 1}へ`}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-warm-black transition-all duration-400 ease-magnetic hover:brightness-90"
        >
          {currentPage + 1}
        </Link>,
      );
    }

    // 省略記号（必要な場合）
    if (currentPage < totalPages - 2) {
      pageNumbers.push(
        <span key="ellipsis2" className="px-3 py-2 text-warm-black" aria-hidden="true">
          ...
        </span>,
      );
    }

    // 末尾ページ
    if (totalPages !== 1) {
      const isLastCurrent = currentPage === totalPages;
      pageNumbers.push(
        <Link
          key={totalPages}
          href={{
            search: createSearchParams(totalPages),
          }}
          aria-label={`ページ${totalPages}へ`}
          aria-current={isLastCurrent ? "page" : undefined}
          className={twMerge(
            "rounded-md border border-gray-300 px-3 py-2 transition-all duration-400 ease-magnetic",
            isLastCurrent ? "bg-warm-black text-white" : "bg-white text-warm-black hover:brightness-90",
          )}
        >
          {totalPages}
        </Link>,
      );
    }

    return pageNumbers;
  };

  const pageNumbers = renderPageNumbers();
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

      <div className="flex items-center gap-2">{pageNumbers}</div>

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
