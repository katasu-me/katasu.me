import type { Meta, StoryObj } from "@storybook/react";

import DemoImages from "./index";

const meta = {
  title: "App/DemoImages",
  component: DemoImages,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DemoImages>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
