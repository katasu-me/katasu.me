import Link from "next/link";
import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";
import TagLink from "./TabLink";

type Props = {
  tags: ComponentProps<typeof TagLink>[];
  userId: string;
  className?: string;
};

export default function TagLinks({ tags, userId, className }: Props) {
  return (
    <div className={twMerge("flex flex-wrap gap-2 py-1", className)}>
      {tags.map((tag) => (
        <TagLink key={tag.id} {...tag} />
      ))}
      <Link
        className="interactive-scale-brightness relative flex h-8 shrink-0 items-center justify-center overflow-hidden rounded-md border border-warm-black bg-warm-white px-4 py-2 text-center text-warm-black text-xs"
        href={`/user/${userId}/tag`}
      >
        もっとみる
      </Link>
    </div>
  );
}
