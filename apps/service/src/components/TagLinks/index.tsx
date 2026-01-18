import type { Tag } from "@katasu.me/service-db";
import { Link } from "@tanstack/react-router";
import { twMerge } from "tailwind-merge";
import TagLink from "./TabLink";

type Props = {
  tags: Pick<Tag, "id" | "name">[];
  userSlug: string;
  className?: string;
};

export default function TagLinks({ tags, userSlug, className }: Props) {
  return (
    <div className={twMerge("flex flex-wrap gap-2 py-1", className)}>
      {tags.map((tag) => (
        <TagLink key={tag.id} id={tag.id} name={tag.name} userSlug={userSlug} />
      ))}
      <Link
        className="interactive-scale-brightness relative flex h-8 shrink-0 items-center justify-center overflow-hidden rounded-md border border-warm-black bg-warm-white px-4 py-2 text-center text-warm-black text-xs"
        to="/user/$userSlug/tag"
        params={{ userSlug }}
      >
        もっとみる
      </Link>
    </div>
  );
}
