import type { Meta, StoryObj } from "@storybook/react";
import EmptyState from "./index";

const meta = {
  title: "Components/EmptyState",
  component: EmptyState,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    message: "まだなにもありません",
  },
};

export const CustomMessage: Story = {
  args: {
    message: "コンテンツが見つかりませんでした",
  },
};
