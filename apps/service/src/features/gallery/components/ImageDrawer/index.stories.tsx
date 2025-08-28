import type { Meta, StoryObj } from "@storybook/react";
import ImageDrawer from "./";

const meta = {
  title: "Gallery/ImageDrawer",
  component: ImageDrawer,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ImageDrawer>;

export default meta;

type Story = StoryObj<typeof ImageDrawer>;

export const Default: Story = {
  args: {},
};
