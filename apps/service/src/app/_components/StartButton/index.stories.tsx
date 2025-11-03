import type { Meta, StoryObj } from "@storybook/react";
import { StartButtonFallback } from "./index";

const meta = {
  title: "App/StartButton",
  component: StartButtonFallback,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof StartButtonFallback>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  args: {},
};
