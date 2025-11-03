import type { Meta, StoryObj } from "@storybook/react";
import IconDots from "@/assets/icons/dots.svg";
import IconFlag from "@/assets/icons/flag.svg";
import IconSettings from "@/assets/icons/settings.svg";
import IconTrash from "@/assets/icons/trash.svg";
import IconButton from "@/components/IconButton";
import DropdownMenu from ".";

const meta = {
  title: "Components/DropdownMenu",
  component: DropdownMenu,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    trigger: (
      <IconButton title="メニューを開く">
        <IconDots className="size-6" />
      </IconButton>
    ),
    items: [
      <button type="button" key="settings">
        <IconSettings className="size-4" />
        <span>設定</span>
      </button>,
      <button type="button" key="flag">
        <IconFlag className="size-4" />
        <span>報告</span>
      </button>,
      <button type="button" key="delete">
        <IconTrash className="size-4" />
        <span>削除</span>
      </button>,
    ],
  },
};

export const WithLinks: Story = {
  args: {
    trigger: (
      <IconButton title="メニューを開く">
        <IconDots className="size-6" />
      </IconButton>
    ),
    items: [
      <a href="/settings" key="settings">
        <IconSettings className="size-4" />
        <span>設定</span>
      </a>,
      <a href="/report" key="flag">
        <IconFlag className="size-4" />
        <span>報告</span>
      </a>,
    ],
  },
};

export const SingleItem: Story = {
  args: {
    trigger: (
      <IconButton title="メニューを開く">
        <IconDots className="size-6" />
      </IconButton>
    ),
    items: [
      <button type="button" key="settings">
        <IconSettings className="size-4" />
        <span>設定</span>
      </button>,
    ],
  },
};

export const AlignStart: Story = {
  args: {
    trigger: (
      <IconButton title="メニューを開く">
        <IconDots className="size-6" />
      </IconButton>
    ),
    items: [
      <button type="button" key="settings">
        <IconSettings className="size-4" />
        <span>設定</span>
      </button>,
      <button type="button" key="flag">
        <IconFlag className="size-4" />
        <span>報告</span>
      </button>,
    ],
    align: "start",
  },
};

export const WithConditionalItems: Story = {
  args: {
    trigger: (
      <IconButton title="メニューを開く">
        <IconDots className="size-6" />
      </IconButton>
    ),
    items: [
      <button type="button" key="settings">
        <IconSettings className="size-4" />
        <span>設定</span>
      </button>,
      false, // 条件により非表示
      <button type="button" key="delete">
        <IconTrash className="size-4" />
        <span>削除</span>
      </button>,
    ],
  },
};
