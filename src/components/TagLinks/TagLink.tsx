import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import BudouX from "../BudouX";

type TagLinkProps = {
  name: string;
  href: string;
  image: string | StaticImageData;
};

export default function TagLink({ name, href, image }: TagLinkProps) {
  return (
    <Link
      className="relative flex h-12 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-warm-black-50 p-2 text-center transition-all duration-400 ease-magnetic hover:scale-105 hover:brightness-90 active:scale-95 md:h-16 md:w-24"
      href={href}
    >
      <Image className="absolute inset-0 object-cover blur-xs brightness-70" src={image} alt={`タグ: ${name}`} fill />
      <p className="z-1 text-warm-white text-xs">
        <BudouX>{name}</BudouX>
      </p>
    </Link>
  );
}
