import { css } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";
import animationEmojiPlant from "@/assets/animation-emoji/512.gif?url";

type Props = {
  title?: string;
  cssProps?: SystemStyleObject;
};

export function Loading({ title, cssProps }: Props) {
  return (
    <div
      className={css(
        {
          display: "flex",
          h: "full",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        },
        cssProps,
      )}
    >
      <img className={css({ boxSize: "16" })} src={animationEmojiPlant} alt="生えてくる双葉" />
      <p className={css({ mt: "3", fontSize: "sm", lineHeight: "5", letterSpacing: "wider" })}>
        {title || "ちょっとまってね"}
      </p>
    </div>
  );
}
