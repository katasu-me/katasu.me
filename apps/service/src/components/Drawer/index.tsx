import { type DialogProps, Drawer as VaulDrawer } from "@arrow2nd/vaul";
import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

type Props = {
  title: ReactNode;
  children: (components: { Description: typeof VaulDrawer.Description; Close: typeof VaulDrawer.Close }) => ReactNode;

  triggerChildren?: ReactNode;
  titleClassname?: string;
  innerClassname?: string;
} & Pick<DialogProps, "open" | "onOpenChange" | "handleOnly" | "dismissible">;

export default function Drawer({ title, children, triggerChildren, titleClassname, innerClassname, ...props }: Props) {
  return (
    <VaulDrawer.Root {...props}>
      {triggerChildren && <VaulDrawer.Trigger asChild>{triggerChildren}</VaulDrawer.Trigger>}
      <VaulDrawer.Portal>
        <VaulDrawer.Overlay className="fixed inset-0 z-floating bg-black/40" />

        <VaulDrawer.Content className="fixed right-0 bottom-0 left-0 z-floating m-2 pc:m-4 h-fit overflow-hidden rounded-xl bg-warm-white p-8 pc:px-4 pt-4 outline-none">
          <VaulDrawer.Handle />

          <div className={twMerge("mx-auto mt-6 max-w-md", innerClassname)}>
            <VaulDrawer.Title className={twMerge("mb-6 text-warm-black text-xl", titleClassname)}>
              {title}
            </VaulDrawer.Title>

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
