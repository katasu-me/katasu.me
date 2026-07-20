import type { Meta, StoryObj } from "@storybook/react";
import TagLink from ".";

const meta = {
  title: "Components/TagLinks/TabLink",
  component: TagLink,
  tags: ["autodocs"],
} satisfies Meta<typeof TagLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: "1",
    name: "日常",
    userSlug: "katasu",
  },
};
