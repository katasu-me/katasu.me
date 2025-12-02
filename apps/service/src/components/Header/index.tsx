import type { PublicUserData } from "@katasu.me/service-db";
import { Link } from "@tanstack/react-router";
import IconDots from "@/assets/icons/dots.svg?react";
import IconFlag from "@/assets/icons/flag.svg?react";
import IconSearch from "@/assets/icons/search.svg?react";
import IconSettings from "@/assets/icons/settings.svg?react";
import DropdownMenu from "@/components/DropdownMenu";
import IconButton from "@/components/IconButton";
import { getUserAvatarUrl } from "@/libs/r2";
import UserIcon from "./UserIcon";

type Props = {
  user: PublicUserData;
  sessionUserId?: string;
};

export default function Header({ user, sessionUserId }: Props) {
  const isOwner = user.id === sessionUserId;

  const menuItems = [
    isOwner && (
      <Link to="/settings">
        <IconSettings className="size-4" />
        <span>設定</span>
      </Link>
    ),
    !isOwner && (
      <Link
        to="/report/user"
        search={{
          reportedUserId: user.id,
          reporterUserId: sessionUserId,
        }}
        target="_blank"
        rel="noopener"
      >
        <IconFlag className="size-4" />
        <span>このユーザーを報告</span>
      </Link>
    ),
  ];

  return (
    <header className="col-start-2 flex items-center justify-between">
      <UserIcon
        userId={user.id}
        username={user.name}
        iconImage={user.hasAvatar ? getUserAvatarUrl(user.id, user.avatarSetAt) : undefined}
      />

      <div className="flex items-center gap-2">
        {/* TODO: 検索機能 */}
        <IconButton>
          <IconSearch className="h-6 w-6 opacity-25" />
        </IconButton>

        <DropdownMenu
          trigger={
            <IconButton>
              <IconDots className="h-6 w-6" />
            </IconButton>
          }
          items={menuItems}
        />
      </div>
    </header>
  );
}
