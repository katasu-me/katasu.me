import type { Tag } from "@katasu.me/service-db";
import { Link } from "@tanstack/react-router";
import { css, cx } from "styled-system/css";
import BudouX from "@/components/BudouX";

type Props = Pick<Tag, "id" | "name"> & {
  userSlug: string;
};

export default function TagLink({ id, name, userSlug }: Props) {
  return (
    <Link
      className={cx(
        "interactive-scale-brightness",
        css({
          position: "relative",
          display: "flex",
          h: "8",
          flexShrink: "0",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          rounded: "md",
          bg: "warm-black",
          px: "4",
          py: "2",
          color: "warm-white",
          textAlign: "center",
          fontSize: "xs",
          lineHeight: "4",
        }),
      )}
      to="/user/$userSlug/tag/$tagId"
      params={{
        userSlug,
        tagId: id,
      }}
      search={{
        view: "timeline",
        page: 1,
      }}
    >
      <BudouX>{`#${name}`}</BudouX>
    </Link>
  );
}
