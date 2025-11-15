import { Image } from "@unpic/react";
import ImageNeko from "@/assets/images/neko.png?url";

import { AUTHOR_NAME, AUTHOR_X_URL } from "@/constants/author";

export default function DevelopedBy() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="text-xs">\ わたしがつくっています /</div>
      <a
        className="interactive-scale flex items-center gap-2"
        href={AUTHOR_X_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          className="size-7 overflow-hidden rounded-full border border-warm-black"
          src={ImageNeko}
          alt={`${AUTHOR_NAME}のアイコン`}
          width={46}
          height={46}
        />
        <span className="tracking-widest">arrow2nd</span>
      </a>
    </div>
  );
}
