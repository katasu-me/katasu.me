import type { User } from "@katasu.me/service-db";
import type { PropsWithChildren } from "react";
import UserIcon from "@/features/auth/components/UserIcon";

type Props = PropsWithChildren<{
  user: User;
}>;

export default function Header({ user, children }: Props) {
  return (
    <header className="col-start-2 flex items-center justify-between">
      <UserIcon userId={user.id} username={user.name} iconImageKey={user.image} />

      <div className="flex items-center gap-2">{children}</div>
    </header>
  );
}
