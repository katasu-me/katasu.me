import * as RadixDropdownMenu from "@radix-ui/react-dropdown-menu";
import type { ComponentProps, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

type Props = {
  trigger: ReactNode;
  items: (ReactNode | false)[];
  contentClassName?: string;
} & Pick<ComponentProps<typeof RadixDropdownMenu.Content>, "align" | "sideOffset">;

export default function DropdownMenu({ trigger, items, contentClassName, align = "end", sideOffset = 5 }: Props) {
  return (
    <RadixDropdownMenu.Root>
      <RadixDropdownMenu.Trigger asChild>{trigger}</RadixDropdownMenu.Trigger>

      <RadixDropdownMenu.Portal>
        <RadixDropdownMenu.Content
          className={twMerge("min-w-[200px] rounded-lg bg-white p-1 shadow-md", contentClassName)}
          sideOffset={sideOffset}
          align={align}
        >
          {items.map((item, index) => {
            if (!item) {
              return null;
            }

            return (
              <RadixDropdownMenu.Item
                key={index.toString()}
                className="flex cursor-pointer items-center gap-2 rounded px-3 py-2 text-sm outline-none transition-colors duration-400 ease-magnetic hover:bg-warm-black/10 focus:bg-warm-black/10"
                asChild
              >
                {item}
              </RadixDropdownMenu.Item>
            );
          })}
        </RadixDropdownMenu.Content>
      </RadixDropdownMenu.Portal>
    </RadixDropdownMenu.Root>
  );
}
