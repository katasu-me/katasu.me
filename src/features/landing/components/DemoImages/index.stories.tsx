import type { Meta, StoryObj } from "@storybook/react";

import DemoImages from "./index";

const meta = {
  title: "app/DemoImages",
  component: DemoImages,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    className: {
      control: "text",
      description: "Additional CSS class names",
    },
  },
} satisfies Meta<typeof DemoImages>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
