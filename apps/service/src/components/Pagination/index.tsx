import { Link, useLocation } from "@tanstack/react-router";
import type { ComponentProps, ReactNode } from "react";
import { css, cva, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";
import ChevronLeft from "@/assets/icons/chevron-left.svg?react";
import ChevronRight from "@/assets/icons/chevron-right.svg?react";
import IconButton from "@/components/IconButton";

type Props = {
  currentPage: number;
  totalPages: number;
  cssProps?: SystemStyleObject;
} & Omit<ComponentProps<"nav">, "children" | "className">;

const pageButtonStyles = cva({
  base: {
    display: "flex",
    w: "10",
    h: "10",
    alignItems: "center",
    justifyContent: "center",
    rounded: "md",
    borderWidth: "1px",
    borderColor: "warm-black",
    transition: "all 400ms token(easings.magnetic)",
  },
  variants: {
    state: {
      active: {
        bg: "warm-black",
        color: "white",
      },
      inactive: {
        bg: "warm-white",
        color: "warm-black",
        _hover: {
          filter: "brightness(0.9)",
        },
      },
    },
  },
});

type PageButtonProps = {
  page: number;
  isCurrent: boolean;
  pathname: string;
};

function PageButton({ page, isCurrent, pathname }: PageButtonProps) {
  if (isCurrent) {
    return (
      <span aria-current="page" className={pageButtonStyles({ state: "active" })}>
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
      className={pageButtonStyles({ state: "inactive" })}
    >
      {page}
    </Link>
  );
}

function Ellipsis() {
  return (
    <span className={css({ px: "2", color: "warm-black" })} aria-hidden="true">
      ...
    </span>
  );
}

export default function Pagination({ currentPage, totalPages, cssProps, ...props }: Props) {
  const location = useLocation();

  const renderPageNumbers = (): ReactNode[] => {
    const items: ReactNode[] = [];

    items.push(<PageButton key={1} page={1} isCurrent={currentPage === 1} pathname={location.pathname} />);

    if (currentPage > 3) {
      items.push(<Ellipsis key="ellipsis1" />);
    }

    if (currentPage > 2) {
      items.push(
        <PageButton key={currentPage - 1} page={currentPage - 1} isCurrent={false} pathname={location.pathname} />,
      );
    }

    if (currentPage !== 1 && currentPage !== totalPages) {
      items.push(<PageButton key={currentPage} page={currentPage} isCurrent={true} pathname={location.pathname} />);
    }

    if (currentPage < totalPages - 1) {
      items.push(
        <PageButton key={currentPage + 1} page={currentPage + 1} isCurrent={false} pathname={location.pathname} />,
      );
    }

    if (currentPage < totalPages - 2) {
      items.push(<Ellipsis key="ellipsis2" />);
    }

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
    <nav
      className={css({ display: "flex", alignItems: "center", justifyContent: "center", gap: "3" }, cssProps)}
      {...props}
    >
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
            <ChevronLeft className={css({ w: "5", h: "5" })} />
          </Link>
        </IconButton>
      )}

      <div className={cx(css({ display: "flex", alignItems: "center", gap: "2" }))}>{pageNumbers}</div>

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
            <ChevronRight className={css({ w: "5", h: "5" })} />
          </Link>
        </IconButton>
      )}
    </nav>
  );
}
