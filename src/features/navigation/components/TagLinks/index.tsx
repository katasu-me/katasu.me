import { twMerge } from "tailwind-merge";
import TagLink from "./TabLink";

type Tag = {
  name: string;
  href: string;
};

type TagLinksProps = {
  tags: Tag[];
  className?: string;
};

export default function TagLinks({ tags, className }: TagLinksProps) {
  return (
    <div className={twMerge("flex gap-2 overflow-x-scroll py-1", className)}>
      {tags.map((tag) => (
        <TagLink key={tag.name} name={tag.name} href={tag.href} />
      ))}
    </div>
  );
}
