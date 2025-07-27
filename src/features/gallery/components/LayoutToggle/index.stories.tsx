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
      options: ["masonry", "random"],
    },
  },
} satisfies Meta<typeof LayoutToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: "masonry",
    masonryHref: "/masonry",
    randomHref: "/random",
  },
};

export const Masonry: Story = {
  args: {
    value: "masonry",
    masonryHref: "/masonry",
    randomHref: "/random",
  },
};

export const Random: Story = {
  args: {
    value: "random",
    masonryHref: "/masonry",
    randomHref: "/random",
  },
};
