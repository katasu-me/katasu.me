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
      className="relative flex h-16 w-24 items-center justify-center overflow-hidden rounded-md bg-warm-black-50 p-2 text-center transition-all duration-400 ease-magnetic hover:scale-105 hover:brightness-90 active:scale-95"
      href={href}
    >
      <Image className="absolute inset-0 object-cover brightness-70" src={image} alt={`タグ: ${name}`} fill />
      <p className="z-1 text-warm-white text-xs">
        <BudouX>{name}</BudouX>
      </p>
    </Link>
  );
}
