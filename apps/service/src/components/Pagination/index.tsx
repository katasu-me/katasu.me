import { Link, useLocation } from "@tanstack/react-router";
import type { ComponentProps, ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import ChevronLeft from "@/assets/icons/chevron-left.svg?react";
import ChevronRight from "@/assets/icons/chevron-right.svg?react";
import IconButton from "@/components/IconButton";

type Props = {
  currentPage: number;
  totalPages: number;
  className?: string;
} & Omit<ComponentProps<"nav">, "children">;

const baseButtonStyle =
  "flex size-10 items-center justify-center rounded-md border border-warm-black transition-all duration-400 ease-magnetic";
const activeButtonStyle = "bg-warm-black text-white";
const inactiveButtonStyle = "bg-warm-white text-warm-black hover:brightness-90";

type PageButtonProps = {
  page: number;
  isCurrent: boolean;
  pathname: string;
};

function PageButton({ page, isCurrent, pathname }: PageButtonProps) {
  if (isCurrent) {
    return (
      <span aria-current="page" className={twMerge(baseButtonStyle, activeButtonStyle)}>
        {page}
      </span>
    );
  }

  return (
    <Link
      to={pathname}
      search={(prev) => ({
        ...prev,
        page,
      })}
      aria-label={`ページ${page}へ`}
      className={twMerge(baseButtonStyle, inactiveButtonStyle)}
    >
      {page}
    </Link>
  );
}

function Ellipsis() {
  return (
    <span className="px-2 text-warm-black" aria-hidden="true">
      ...
    </span>
  );
}

export default function Pagination({ currentPage, totalPages, className, ...props }: Props) {
  const location = useLocation();

  const renderPageNumbers = (): ReactNode[] => {
    const items: ReactNode[] = [];

    // 先頭
    items.push(<PageButton key={1} page={1} isCurrent={currentPage === 1} pathname={location.pathname} />);

    // 省略
    if (currentPage > 3) {
      items.push(<Ellipsis key="ellipsis1" />);
    }

    if (currentPage > 2) {
      items.push(
        <PageButton key={currentPage - 1} page={currentPage - 1} isCurrent={false} pathname={location.pathname} />,
      );
    }

    // 現在のページ
    if (currentPage !== 1 && currentPage !== totalPages) {
      items.push(<PageButton key={currentPage} page={currentPage} isCurrent={true} pathname={location.pathname} />);
    }

    if (currentPage < totalPages - 1) {
      items.push(
        <PageButton key={currentPage + 1} page={currentPage + 1} isCurrent={false} pathname={location.pathname} />,
      );
    }

    // 省略
    if (currentPage < totalPages - 2) {
      items.push(<Ellipsis key="ellipsis2" />);
    }

    // 末尾
    if (totalPages !== 1) {
      items.push(
        <PageButton
          key={totalPages}
          page={totalPages}
          isCurrent={currentPage === totalPages}
          pathname={location.pathname}
        />,
      );
    }

    return items;
  };

  const pageNumbers = renderPageNumbers();
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <nav className={twMerge("flex items-center justify-center gap-3", className)} {...props}>
      {!isFirstPage && (
        <IconButton asChild>
          <Link
            to={location.pathname}
            search={(prev) => ({
              ...prev,
              page: currentPage - 1,
            })}
            title="前のページへ"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </IconButton>
      )}

      <div className="flex items-center gap-2">{pageNumbers}</div>

      {!isLastPage && (
        <IconButton asChild>
          <Link
            to={location.pathname}
            search={(prev) => ({
              ...prev,
              page: currentPage + 1,
            })}
            title="次のページへ"
          >
            <ChevronRight className="h-5 w-5" />
          </Link>
        </IconButton>
      )}
    </nav>
  );
}
