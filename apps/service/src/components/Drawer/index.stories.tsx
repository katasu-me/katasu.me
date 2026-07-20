import type { Meta, StoryObj } from "@storybook/react";
import type React from "react";
import { useState } from "react";
import { css } from "styled-system/css";
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
            <Description className={css({ mb: "4", color: "rgba(72, 48, 48, 0.8)" })}>
              これはDrawerコンポーネントのデモです。モーダルのようにコンテンツを表示できます。
            </Description>
            {children ? (
              children({ Description, Close })
            ) : (
              <div className={css({ "& > * + *": { mt: "4" } })}>
                <div className={css({ display: "flex", gap: "2" })}>
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
    innerCssProps: css.raw({ maxW: "lg", bg: "warm-black-10", p: "6", rounded: "lg" }),
  },
};

export const LongContent: Story = {
  render: (args) => (
    <DrawerDemo {...args}>
      {({ Description, Close }) => (
        <div className={css({ "& > * + *": { mt: "4" } })}>
          <Description className={css({ color: "rgba(72, 48, 48, 0.8)" })}>
            これは長いコンテンツを持つDrawerのサンプルです。Drawerは内容に応じて適切にスクロールされます。
          </Description>
          <div className={css({ "& > * + *": { mt: "2" } })}>
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
              <div
                key={item}
                className={css({ rounded: "sm", bg: "warm-black-10", p: "2", fontSize: "sm", lineHeight: "5" })}
              >
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
