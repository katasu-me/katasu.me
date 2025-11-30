import type { Meta, StoryObj } from "@storybook/react";
import SnackbarContent from "./SnackbarContent";

const meta = {
  title: "ImageUpload/UploadSnackbar",
  component: SnackbarContent,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="relative h-[300px] bg-warm-white">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SnackbarContent>;

export default meta;

type Story = StoryObj<typeof SnackbarContent>;

export const Uploading: Story = {
  args: {
    status: "uploading",
    isVisible: true,
  },
};

export const Success: Story = {
  args: {
    status: "success",
    isVisible: true,
  },
};
