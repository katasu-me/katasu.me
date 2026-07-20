import type { Meta, StoryObj } from "@storybook/react";
import TagLinks from ".";

const meta = {
  title: "Components/TagLinks",
  component: TagLinks,
  tags: ["autodocs"],
} satisfies Meta<typeof TagLinks>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    userSlug: "katasu",
    tags: [
      { id: "1", name: "日常" },
      { id: "2", name: "旅行" },
    ],
  },
};
