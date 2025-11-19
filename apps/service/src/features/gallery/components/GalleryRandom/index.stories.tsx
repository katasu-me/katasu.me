import type { Meta, StoryObj } from "@storybook/react";
import GalleryRandom from "./";

const meta = {
  title: "UserPage/GalleryRandom",
  component: GalleryRandom,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GalleryRandom>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    fetchRandomOptions: {
      type: "user",
      userId: "test-user-id",
    },
  },
};
