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

        <VaulDrawer.Content className="fixed right-0 bottom-0 z-floating max-h-[calc(100dvh-1rem)] pc:max-h-[calc(100dvh-2rem)] w-full p-2 pc:p-4">
          <div className="flex flex-col rounded-xl bg-warm-white p-8 pc:px-4 pt-4 outline-none">
            <VaulDrawer.Handle className="shrink-0" />

            <div className={twMerge("mx-auto mt-6 pc:w-md w-full", innerClassname)}>
              <VaulDrawer.Title className={twMerge("mb-6 text-warm-black text-xl", titleClassname)}>
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
