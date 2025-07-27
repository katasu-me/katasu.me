import type { Meta, StoryObj } from "@storybook/react";
import TagLink from ".";

const meta = {
  title: "Components/TagLinks/TagLink",
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
    image: {
      control: false,
      description: "タグの背景画像",
    },
  },
} satisfies Meta<typeof TagLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "風景",
    href: "/user/example/tag/landscape",
    image: "https://picsum.photos/200/200?random=1",
  },
};

export const LongName: Story = {
  args: {
    name: "とても長いタグ名のサンプル",
    href: "/user/example/tag/very-long-tag-name",
    image: "https://picsum.photos/200/200?random=2",
  },
};

export const ShortName: Story = {
  args: {
    name: "猫",
    href: "/user/example/tag/cat",
    image: "https://picsum.photos/200/200?random=3",
  },
};
