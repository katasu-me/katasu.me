import type { Meta, StoryObj } from "@storybook/react";
import Message from ".";

const meta = {
  title: "Components/Message",
  component: Message,
  tags: ["autodocs"],
} satisfies Meta<typeof Message>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    message: "からっぽです",
  },
};

export const ErrorMessage: Story = {
  args: {
    message: "エラーが発生しました",
    icon: "error",
  },
};
