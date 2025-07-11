import type { StaticImageData } from "next/image";
import { twMerge } from "tailwind-merge";
import IconTag from "@/assets/icons/tag.svg";
import TagLink from "./TagLink";

type Tag = {
  name: string;
  href: string;
  image: string | StaticImageData;
};

type TagLinksProps = {
  tags: Tag[];
  className?: string;
};

export default function TagLinks({ tags, className }: TagLinksProps) {
  return (
    <div className={twMerge("flex gap-2 overflow-x-scroll py-1", className)}>
      <div className="flex h-8 w-20 shrink-0 items-center justify-center gap-1 rounded-md bg-warm-black p-2 text-center text-warm-white md:h-12 md:w-26">
        <IconTag className="h-3 w-3" />
        <p className="text-sm">タグ</p>
      </div>
      {tags.map((tag) => (
        <TagLink key={tag.name} name={tag.name} href={tag.href} image={tag.image} />
      ))}
    </div>
  );
}
