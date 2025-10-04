import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";
import TagLink from "./TabLink";

type Props = {
  tags: ComponentProps<typeof TagLink>[];
  className?: string;
};

export default function TagLinks({ tags, className }: Props) {
  return (
    <div className={twMerge("flex gap-2 overflow-x-scroll py-1", className)}>
      {tags.map((tag) => (
        <TagLink key={tag.id} {...tag} />
      ))}
    </div>
  );
}
