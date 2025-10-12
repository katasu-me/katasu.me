import Image from "next/image";
import Link from "next/link";
import { twMerge } from "tailwind-merge";

type Props = {
  userId: string;
  username: string;
  iconImageKey: string | undefined | null;
  className?: string;
};

function getUserAvatarUrl(imageKey: string | undefined | null): string {
  const bucketPublicUrl = process.env.NEXT_PUBLIC_R2_URL;

  if (!bucketPublicUrl) {
    console.error("R2のパブリックURLが設定されていません");
    return "/images/default-avatar-icon.avif";
  }

  if (!imageKey) {
    return "/images/default-avatar-icon.avif";
  }

  return `${bucketPublicUrl}/${imageKey}`;
}

export default function UserIcon({ userId, username, iconImageKey, className }: Props) {
  const avatarImageUrl = getUserAvatarUrl(iconImageKey);
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
