import type { Meta, StoryObj } from "@storybook/react";
import LayoutToggle from "./index";

const meta = {
  title: "Gallery/LayoutToggle",
  component: LayoutToggle,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: "radio",
      options: ["timeline", "random"],
    },
  },
  args: {
    value: "timeline",
  },
} satisfies Meta<typeof LayoutToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Random: Story = {
  args: {
    value: "random",
  },
};
