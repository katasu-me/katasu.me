import type { Meta, StoryObj } from "@storybook/react";
import Message from "./index";

const meta = {
  title: "Components/Message",
  component: Message,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Message>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    message: "まだなにもありません",
  },
};
