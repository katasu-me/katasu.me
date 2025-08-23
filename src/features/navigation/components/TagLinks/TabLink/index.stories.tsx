import type { Meta, StoryObj } from "@storybook/react";
import TagLink from ".";

const meta = {
  title: "Navigation/TagLinks/TagLink",
  component: TagLink,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    name: {
      control: "text",
      description: "タグの名前",
    },
    href: {
      control: "text",
      description: "リンク先のURL",
    },
  },
} satisfies Meta<typeof TagLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "風景",
    href: "/user/example/tag/landscape",
  },
};

export const LongName: Story = {
  args: {
    name: "とても長いタグ名のサンプル",
    href: "/user/example/tag/very-long-tag-name",
  },
};

export const ShortName: Story = {
  args: {
    name: "猫",
    href: "/user/example/tag/cat",
  },
};
