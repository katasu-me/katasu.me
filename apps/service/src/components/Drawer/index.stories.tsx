import type { Meta, StoryObj } from "@storybook/react";
import type React from "react";
import { useState } from "react";
import Button from "../Button";
import Drawer from "./index";

const meta: Meta<typeof Drawer> = {
  title: "Components/Drawer",
  component: Drawer,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof meta>;

type DrawerDemoProps = {
  children?: React.ComponentProps<typeof Drawer>["children"];
} & React.ComponentProps<typeof Drawer>;

function DrawerDemo({ children, ...args }: DrawerDemoProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Drawer</Button>
      <Drawer {...args} open={open} onOpenChange={setOpen}>
        {({ Description, Close }) => (
          <>
            <Description className="mb-4 text-warm-black/80">
              これはDrawerコンポーネントのデモです。モーダルのようにコンテンツを表示できます。
            </Description>
            {children ? (
              children({ Description, Close })
            ) : (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Close asChild>
                    <Button>閉じる</Button>
                  </Close>
                  <Button variant="outline">キャンセル</Button>
                </div>
              </div>
            )}
          </>
        )}
      </Drawer>
    </>
  );
}

export const Default: Story = {
  render: (args) => <DrawerDemo {...args} />,
  args: {
    title: "Drawer サンプル",
  },
};

export const WithDescription: Story = {
  render: (args) => <DrawerDemo {...args} />,
  args: {
    title: "説明付きDrawer",
  },
};

export const WithCustomInnerClassName: Story = {
  render: (args) => <DrawerDemo {...args} />,
  args: {
    title: "カスタムスタイル",
    innerClassname: "max-w-lg bg-warm-gray/10 p-6 rounded-lg",
  },
};

export const LongContent: Story = {
  render: (args) => (
    <DrawerDemo {...args}>
      {({ Description, Close }) => (
        <div className="space-y-4">
          <Description className="text-warm-black/80">
            これは長いコンテンツを持つDrawerのサンプルです。Drawerは内容に応じて適切にスクロールされます。
          </Description>
          <div className="space-y-2">
            {[
              "アイテム 1",
              "アイテム 2",
              "アイテム 3",
              "アイテム 4",
              "アイテム 5",
              "アイテム 6",
              "アイテム 7",
              "アイテム 8",
              "アイテム 9",
              "アイテム 10",
            ].map((item) => (
              <div key={item} className="rounded bg-warm-gray/10 p-2 text-sm">
                {item}
              </div>
            ))}
          </div>
          <Close asChild>
            <Button>サンプル処理</Button>
          </Close>
        </div>
      )}
    </DrawerDemo>
  ),
  args: {
    title: "長いコンテンツ",
  },
};
