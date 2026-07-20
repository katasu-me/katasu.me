import type { PublicUserData } from "@katasu.me/service-db";
import { css } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";
import { getUserAvatarUrl } from "@/libs/r2";
import UserIcon from "./UserIcon";

type Props = {
  user: PublicUserData;
  cssProps?: SystemStyleObject;
};

export default function Header({ user, cssProps }: Props) {
  return (
    <header
      className={css(
        {
          gridColumnStart: "2",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        },
        cssProps,
      )}
    >
      <UserIcon
        userSlug={user.customUrl || user.id}
        username={user.name}
        iconImage={user.hasAvatar ? getUserAvatarUrl(user.id, user.avatarSetAt) : undefined}
      />
    </header>
  );
}
