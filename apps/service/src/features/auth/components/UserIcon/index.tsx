import Image from "next/image";
import Link from "next/link";
import { twMerge } from "tailwind-merge";
import { getUserAvatarUrl } from "@/lib/image";

type Props = {
  userId: string;
  username: string;
  hasAvatar: boolean;
  className?: string;
};

export default function UserIcon({ userId, username, hasAvatar, className }: Props) {
  const avatarImageUrl = getUserAvatarUrl(userId, hasAvatar);
  const alt = `${username}さんのアイコン`;

  return (
    <Link className="interactive-scale flex items-center gap-3" href={`/user/${userId}`}>
      <Image
        className={twMerge("size-10 overflow-hidden rounded-full border border-warm-black-50", className)}
        src={avatarImageUrl}
        alt={alt}
        width={46}
        height={46}
      />
      <span className="tracking-widest">{username}</span>
    </Link>
  );
}
