import type { Meta, StoryObj } from "@storybook/react";
import TagLinks from ".";

const meta: Meta<typeof TagLinks> = {
  title: "Navigation/TagLinks",
  component: TagLinks,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    tags: [
      { name: "画像", userId: "test" },
      { name: "イラスト", userId: "test" },
      { name: "風景", userId: "test" },
    ],
  },
};

export const SingleTag: Story = {
  args: {
    tags: [{ name: "画像", userId: "test" }],
  },
};

export const ManyTags: Story = {
  args: {
    tags: [
      { name: "画像", userId: "test" },
      { name: "イラスト", userId: "test" },
      { name: "風景", userId: "test" },
      { name: "ポートレート", userId: "test" },
      { name: "モノクロ", userId: "test" },
      { name: "夕焼け", userId: "test" },
      { name: "海", userId: "test" },
      { name: "山", userId: "test" },
    ],
  },
};
