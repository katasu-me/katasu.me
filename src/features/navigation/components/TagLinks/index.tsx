import { twMerge } from "tailwind-merge";
import IconTag from "@/assets/icons/tag.svg";
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
      <div className="flex h-8 shrink-0 items-center justify-center gap-1 rounded-md bg-warm-black p-2 px-4 text-center text-warm-white">
        <IconTag className="h-3 w-3" />
        <p className="text-xs">タグ</p>
      </div>
      {tags.map((tag) => (
        <TagLink key={tag.name} name={tag.name} href={tag.href} />
      ))}
    </div>
  );
}
