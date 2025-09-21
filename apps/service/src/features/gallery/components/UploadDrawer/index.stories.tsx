import type { Meta, StoryObj } from "@storybook/react";
import UploadDrawer from "./";

const meta = {
  title: "Gallery/UploadDrawer",
  component: UploadDrawer,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof UploadDrawer>;

export default meta;

type Story = StoryObj<typeof UploadDrawer>;

export const Default: Story = {
  args: {},
};
