import Image from "next/image";
import ImageNeko from "@/assets/images/neko.png";

import { AUTHOR_NAME, AUTHOR_X_URL } from "@/constants/author";

export default function DevelopedBy() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="text-xs">\ わたしがつくっています /</div>
      <a href={AUTHOR_X_URL} target="_blank" rel="noopener noreferrer">
        <Image
          className="block h-12 w-12 rounded-full border border-warm-black transition-opacity duration-400 ease-magnetic hover:brightness-90"
          src={ImageNeko.src}
          alt={`${AUTHOR_NAME}のアイコン`}
        />
      </a>
    </div>
  );
}
