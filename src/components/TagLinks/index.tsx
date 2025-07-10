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
    <div>
      <div className={twMerge("flex flex-wrap gap-2", className)}>
        <div className="flex h-16 w-24 items-center justify-center gap-1 rounded-md bg-warm-black p-2 text-center text-warm-white">
          <IconTag className="h-4 w-4" />
          <p className="text-sm">タグ</p>
        </div>
        {tags.map((tag) => (
          <TagLink key={tag.name} name={tag.name} href={tag.href} image={tag.image} />
        ))}
      </div>
    </div>
  );
}
