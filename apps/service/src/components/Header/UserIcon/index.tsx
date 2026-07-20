import { Link } from "@tanstack/react-router";
import { css, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";
import { DEFAULT_AVATAR_URL } from "@/constants/image";

type Props = {
  userSlug: string;
  username: string;
  iconImage?: string;
  cssProps?: SystemStyleObject;
};

export default function UserIcon({ userSlug, username, iconImage, cssProps }: Props) {
  const avatarImageUrl = iconImage ? iconImage : DEFAULT_AVATAR_URL;
  const alt = `${username}さんのアイコン`;

  return (
    <Link
      className={cx(
        "interactive-scale",
        css({
          display: "flex",
          alignItems: "center",
          gap: "3",
        }),
      )}
      to="/user/$userSlug"
      params={{ userSlug }}
      search={{
        view: "timeline",
        page: 1,
      }}
    >
      <img
        className={css(
          {
            w: "10",
            h: "10",
            overflow: "hidden",
            rounded: "full",
            borderWidth: "1px",
            borderColor: "warm-black-50",
          },
          cssProps,
        )}
        src={avatarImageUrl}
        alt={alt}
        width={46}
        height={46}
      />
      <span className={css({ letterSpacing: "widest" })}>{username}</span>
    </Link>
  );
}
