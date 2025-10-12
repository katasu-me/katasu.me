import Image from "next/image";
import Link from "next/link";
import { getUserAvatarUrl } from "@/lib/r2";

type Props = {
  userId: string;
  username: string;
  iconImageKey: string | null;
};

export default function UserIcon({ userId, username, iconImageKey }: Props) {
  const avatarImageUrl = getUserAvatarUrl(iconImageKey);
  const alt = `${username}さんのアイコン`;

  return (
    <Link className="interactive-scale flex items-center gap-3" href={`/user/${userId}`}>
      <div className="relative inline-block h-10 w-10 overflow-hidden rounded-full border border-warm-black-50">
        <Image src={avatarImageUrl} alt={alt} fill />
      </div>
      <span className="tracking-widest">{username}</span>
    </Link>
  );
}
