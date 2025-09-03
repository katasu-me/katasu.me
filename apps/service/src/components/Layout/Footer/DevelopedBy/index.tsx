import Image from "next/image";
import ImageNeko from "@/assets/images/neko.png";

import { AUTHOR_NAME, AUTHOR_X_URL } from "@/components/constants/author";

export default function DevelopedBy() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="text-xs">\ わたしがつくっています /</div>
      <a
        className="relative block h-12 w-12 overflow-hidden rounded-full border border-warm-black transition-all duration-400 ease-magnetic hover:brightness-90"
        href={AUTHOR_X_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image src={ImageNeko.src} alt={`${AUTHOR_NAME}のアイコン`} width={46} height={46} />
      </a>
    </div>
  );
}
