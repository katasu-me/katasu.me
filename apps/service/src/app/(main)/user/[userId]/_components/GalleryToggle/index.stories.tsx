import type { Meta, StoryObj } from "@storybook/react";
import GalleryToggle from "./index";

const meta = {
  title: "UserPage/GalleryToggle",
  component: GalleryToggle,
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
    onRandomClick: () => {},
  },
} satisfies Meta<typeof GalleryToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Random: Story = {
  args: {
    value: "random",
  },
};
