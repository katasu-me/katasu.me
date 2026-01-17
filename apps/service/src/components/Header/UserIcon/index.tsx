import { Link } from "@tanstack/react-router";
import { twMerge } from "tailwind-merge";
import { DEFAULT_AVATAR_URL } from "@/constants/image";

type Props = {
  userId: string;
  username: string;
  iconImage?: string;
  className?: string;
};

export default function UserIcon({ userId, username, iconImage, className }: Props) {
  const avatarImageUrl = iconImage ? iconImage : DEFAULT_AVATAR_URL;
  const alt = `${username}さんのアイコン`;

  return (
    <Link
      className="interactive-scale flex items-center gap-3"
      to="/user/$userSlug"
      params={{ userSlug: userId }}
      search={{
        view: "timeline",
        page: 1,
      }}
    >
      <img
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
