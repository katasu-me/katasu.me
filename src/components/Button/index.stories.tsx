import type { Meta, StoryObj } from "@storybook/react";
import Button from "./";

const meta = {
  title: "Components/Button",
  component: Button,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    onClick: { action: "clicked" },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof Button>;

export const All: Story = {
  args: {
    children: "クリック",
  },
};
