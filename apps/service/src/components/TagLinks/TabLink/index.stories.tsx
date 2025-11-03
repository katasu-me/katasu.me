import type { Meta, StoryObj } from "@storybook/react";
import TagLink from ".";

const meta = {
  title: "Components/TagLinks/TagLink",
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
    id: "1",
    name: "風景",
  },
};

export const LongName: Story = {
  args: {
    id: "2",
    name: "とても長いタグ名のサンプル",
  },
};

export const ShortName: Story = {
  args: {
    id: "3",
    name: "猫",
  },
};
