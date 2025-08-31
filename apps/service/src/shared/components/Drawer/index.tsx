import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { type DialogProps, Drawer as VaulDrawer } from "vaul";

type Props = {
  /** タイトル */
  title: string;
  /** 内側 */
  children: (components: { Description: typeof VaulDrawer.Description; Close: typeof VaulDrawer.Close }) => ReactNode;

  /** トリガー要素 */
  triggerChildren?: ReactNode;
  /** 内側のコンテンツのクラス名 */
  innerClassname?: string;
} & Pick<DialogProps, "open" | "onOpenChange" | "handleOnly">;

export default function Drawer({ title, children, triggerChildren, innerClassname, ...props }: Props) {
  return (
    <VaulDrawer.Root {...props}>
      {triggerChildren && <VaulDrawer.Trigger asChild>{triggerChildren}</VaulDrawer.Trigger>}
      <VaulDrawer.Portal>
        <VaulDrawer.Overlay className="fixed inset-0 bg-black/40" />
        <VaulDrawer.Content className="fixed right-0 bottom-0 left-0 m-2 pc:m-4 h-fit overflow-hidden rounded-xl bg-warm-white p-8 pc:px-4 pt-4 outline-none">
          <VaulDrawer.Handle />
          <div className={twMerge("mx-auto mt-4 max-w-md", innerClassname)}>
            <VaulDrawer.Title className="mb-4 text-warm-black text-xl">{title}</VaulDrawer.Title>
            {children({
              Description: VaulDrawer.Description,
              Close: VaulDrawer.Close,
            })}
          </div>
        </VaulDrawer.Content>
      </VaulDrawer.Portal>
    </VaulDrawer.Root>
  );
}
