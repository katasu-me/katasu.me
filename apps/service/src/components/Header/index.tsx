import type { PublicUserData } from "@katasu.me/service-db";
import Link from "next/link";
import IconDots from "@/assets/icons/dots.svg";
import IconFlag from "@/assets/icons/flag.svg";
import IconSearch from "@/assets/icons/search.svg";
import IconSettings from "@/assets/icons/settings.svg";
import DropdownMenu from "@/components/DropdownMenu";
import IconButton from "@/components/IconButton";
import { getUserAvatarUrl } from "@/lib/r2";
import UserIcon from "./UserIcon";

type Props = {
  user: PublicUserData;
  showRightMenu?: boolean;
  isOwnerPage?: boolean;
};

export default function Header({ user, showRightMenu = false, isOwnerPage = false }: Props) {
  const menuItems = [
    // TODO: 報告のフォームに遷移
    <Link key="flag" href="/settings">
      <IconFlag className="size-4" />
      <span>このユーザーを報告</span>
    </Link>,
    isOwnerPage && (
      <Link key="settings" href="/settings">
        <IconSettings className="size-4" />
        <span>設定</span>
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

      {showRightMenu && (
        <div className="flex items-center gap-2">
          {/* TODO: 検索機能 */}
          <IconButton title="検索">
            <IconSearch className="h-6 w-6 opacity-25" />
          </IconButton>

          <DropdownMenu
            trigger={
              <IconButton title="その他">
                <IconDots className="h-6 w-6" />
              </IconButton>
            }
            items={menuItems}
          />
        </div>
      )}
    </header>
  );
}
