import type { Meta, StoryObj } from "@storybook/react";
import ChevronLeft from "@/assets/icons/chevron-left.svg?react";
import IconDots from "@/assets/icons/dots.svg?react";
import IconFlag from "@/assets/icons/flag.svg?react";
import IconSearch from "@/assets/icons/search.svg?react";
import IconSettings from "@/assets/icons/settings.svg?react";
import IconButton from "./";

const meta = {
  title: "Components/IconButton",
  component: IconButton,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof IconButton>;

export default meta;

type Story = StoryObj<typeof IconButton>;

export const Search: Story = {
  render: () => (
    <IconButton title="検索">
      <IconSearch className="h-6 w-6" />
    </IconButton>
  ),
};

export const Settings: Story = {
  render: () => (
    <IconButton title="設定">
      <IconSettings className="h-6 w-6" />
    </IconButton>
  ),
};

export const Flag: Story = {
  render: () => (
    <IconButton title="通報">
      <IconFlag className="h-6 w-6" />
    </IconButton>
  ),
};

export const Dots: Story = {
  render: () => (
    <IconButton title="その他">
      <IconDots className="h-6 w-6" />
    </IconButton>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <IconButton title="検索" className="p-1.5">
        <IconSearch className="h-4 w-4" />
      </IconButton>
      <IconButton title="検索">
        <IconSearch className="h-5 w-5" />
      </IconButton>
      <IconButton title="検索">
        <IconSearch className="h-6 w-6" />
      </IconButton>
    </div>
  ),
};

export const AsChild: Story = {
  render: () => (
    <IconButton asChild>
      <a href="/" title="検索">
        <IconSearch className="h-6 w-6" />
      </a>
    </IconButton>
  ),
};

export const CustomIcon: Story = {
  render: () => (
    <IconButton title="戻る">
      <ChevronLeft className="h-5 w-5" />
    </IconButton>
  ),
};

export const AllIcons: Story = {
  render: () => (
    <div className="flex gap-4">
      <IconButton title="検索">
        <IconSearch className="h-6 w-6" />
      </IconButton>
      <IconButton title="設定">
        <IconSettings className="h-6 w-6" />
      </IconButton>
      <IconButton title="通報">
        <IconFlag className="h-6 w-6" />
      </IconButton>
      <IconButton title="その他">
        <IconDots className="h-6 w-6" />
      </IconButton>
    </div>
  ),
};
