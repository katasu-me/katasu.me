import Link from "next/link";
import BudouX from "@/shared/components/BudouX";

type TagLinkProps = {
  name: string;
  href: string;
};

export default function TagLink({ name, href }: TagLinkProps) {
  return (
    <Link
      className="interactive-scale-brightness relative flex h-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-warm-black-50 px-4 py-2 text-center text-warm-white text-xs"
      href={href}
    >
      <BudouX>{`#${name}`}</BudouX>
    </Link>
  );
}
