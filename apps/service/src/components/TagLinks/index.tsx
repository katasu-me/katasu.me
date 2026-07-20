import type { Tag } from "@katasu.me/service-db";
import { Link } from "@tanstack/react-router";
import { css, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";
import TagLink from "./TabLink";

type Props = {
  tags: Pick<Tag, "id" | "name">[];
  userSlug: string;
  cssProps?: SystemStyleObject;
};

export default function TagLinks({ tags, userSlug, cssProps }: Props) {
  return (
    <div className={css({ display: "flex", flexWrap: "wrap", gap: "2", py: "1" }, cssProps)}>
      {tags.map((tag) => (
        <TagLink key={tag.id} id={tag.id} name={tag.name} userSlug={userSlug} />
      ))}
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
            borderWidth: "1px",
            borderColor: "warm-black",
            bg: "warm-white",
            px: "4",
            py: "2",
            color: "warm-black",
            textAlign: "center",
            fontSize: "xs",
            lineHeight: "4",
          }),
        )}
        to="/user/$userSlug/tag"
        params={{ userSlug }}
      >
        もっとみる
      </Link>
    </div>
  );
}
