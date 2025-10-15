import type { PublicUserData } from "@katasu.me/service-db";
import type { PropsWithChildren } from "react";
import UserIcon from "@/features/auth/components/UserIcon";
import { getUserAvatarUrl } from "@/lib/r2";

type Props = PropsWithChildren<{
  user: PublicUserData;
}>;

export default function Header({ user, children }: Props) {
  return (
    <header className="col-start-2 flex items-center justify-between">
      <UserIcon
        userId={user.id}
        username={user.name}
        iconImage={user.hasAvatar ? getUserAvatarUrl(user.id) : undefined}
      />

      <div className="flex items-center gap-2">{children}</div>
    </header>
  );
}
