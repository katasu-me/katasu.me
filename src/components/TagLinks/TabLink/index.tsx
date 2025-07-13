import type { StaticImageData } from "next/image";
import Image from "next/image";
import Link from "next/link";
import BudouX from "@/components/BudouX";

type TagLinkProps = {
  name: string;
  href: string;
  image: string | StaticImageData;
};

export default function TagLink({ name, href, image }: TagLinkProps) {
  return (
    <Link
      className="interactive-scale-brightness relative flex h-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-warm-black-50 px-4 py-2 text-center md:h-10 md:w-26"
      href={href}
    >
      <Image className="absolute inset-0 object-cover blur-xs brightness-70" src={image} alt={`タグ: ${name}`} fill />
      <p className="z-1 text-warm-white text-xs">
        <BudouX>{name}</BudouX>
      </p>
    </Link>
  );
}
