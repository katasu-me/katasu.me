import type { PropsWithChildren } from "react";
import { css } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";
import IconExclamationCircle from "@/assets/icons/exclamation-circle.svg?react";
import IconPlant from "@/assets/icons/plant.svg?react";

const ICON_LIST = {
  plant: IconPlant,
  error: IconExclamationCircle,
} as const;

type Props = PropsWithChildren<{
  message: string;
  icon?: keyof typeof ICON_LIST;
  cssProps?: SystemStyleObject;
}>;

export default function Message({ message, icon = "plant", cssProps, ...props }: Props) {
  const Icon = ICON_LIST[icon];

  return (
    <div
      className={css(
        {
          gridColumnStart: "2",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "2",
          py: "24",
          color: "warm-black-50",
          textAlign: "center",
        },
        cssProps,
      )}
      {...props}
    >
      <Icon className={css({ w: "10", h: "10" })} />
      <p className={css({ fontSize: "base", lineHeight: "6" })}>{message}</p>
    </div>
  );
}
