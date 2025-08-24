import type { Meta, StoryObj } from "@storybook/react";
import TagLink from ".";

const meta = {
  title: "Navigation/TagLinks/TagLink",
  component: TagLink,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    userId: "test",
  },
} satisfies Meta<typeof TagLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "風景",
  },
};

export const LongName: Story = {
  args: {
    name: "とても長いタグ名のサンプル",
  },
};

export const ShortName: Story = {
  args: {
    name: "猫",
  },
};
