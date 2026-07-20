import { css } from "styled-system/css";
import ImageNeko from "@/assets/images/neko.png?url";

import { AUTHOR_NAME, AUTHOR_X_URL } from "@/constants/author";

export default function DevelopedBy() {
  return (
    <div className={css({ display: "flex", flexDirection: "column", alignItems: "center", gap: "3" })}>
      <div className={css({ fontSize: "xs", lineHeight: "4" })}>\ わたしがつくっています /</div>
      <a
        className={`interactive-scale ${css({ display: "flex", alignItems: "center", gap: "2" })}`}
        href={AUTHOR_X_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          className={css({
            boxSize: "7",
            overflow: "hidden",
            rounded: "full",
            borderWidth: "1px",
            borderColor: "warm-black",
          })}
          src={ImageNeko}
          alt={`${AUTHOR_NAME}のアイコン`}
          width={46}
          height={46}
        />
        <span className={css({ letterSpacing: "widest" })}>arrow2nd</span>
      </a>
    </div>
  );
}
