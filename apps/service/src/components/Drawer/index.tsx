import { type DialogProps, Drawer as VaulDrawer } from "@arrow2nd/vaul";
import type { ReactNode } from "react";
import { css, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

type Props = {
  title: ReactNode;
  children: (components: { Description: typeof VaulDrawer.Description; Close: typeof VaulDrawer.Close }) => ReactNode;

  triggerChildren?: ReactNode;
  titleClassname?: string;
  innerCssProps?: SystemStyleObject;
} & Pick<DialogProps, "open" | "onOpenChange" | "handleOnly" | "dismissible">;

export default function Drawer({ title, children, triggerChildren, titleClassname, innerCssProps, ...props }: Props) {
  return (
    <VaulDrawer.Root {...props}>
      {triggerChildren && <VaulDrawer.Trigger asChild>{triggerChildren}</VaulDrawer.Trigger>}
      <VaulDrawer.Portal>
        <VaulDrawer.Overlay className={css({ position: "fixed", inset: "0", zIndex: "floating", bg: "black/40" })} />

        <VaulDrawer.Content
          className={css({
            position: "fixed",
            right: "0",
            bottom: "0",
            zIndex: "floating",
            maxH: { base: "calc(100dvh - 1rem)", pc: "calc(100dvh - 2rem)" },
            w: "full",
            p: { base: "2", pc: "4" },
          })}
        >
          <div
            className={css({
              display: "flex",
              flexDirection: "column",
              rounded: "xl",
              bg: "warm-white",
              px: { base: "8", pc: "4" },
              pt: "4",
              pb: "8",
              outline: "none",
            })}
          >
            <VaulDrawer.Handle className={css({ flexShrink: "0" })} />

            <div className={css({ mx: "auto", mt: "6", w: { base: "full", pc: "md" } }, innerCssProps)}>
              <VaulDrawer.Title
                className={cx(css({ mb: "6", color: "warm-black", fontSize: "xl", lineHeight: "7" }), titleClassname)}
              >
                {title}
              </VaulDrawer.Title>

              {children({
                Description: VaulDrawer.Description,
                Close: VaulDrawer.Close,
              })}
            </div>
          </div>
        </VaulDrawer.Content>
      </VaulDrawer.Portal>
    </VaulDrawer.Root>
  );
}
