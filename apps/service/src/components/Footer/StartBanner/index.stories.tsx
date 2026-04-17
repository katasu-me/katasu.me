import type { Meta, StoryObj } from "@storybook/react";
import StartBanner from "./";

const meta = {
  title: "Components/Footer/StartBanner",
  component: StartBanner,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof StartBanner>;

export default meta;

type Story = StoryObj<typeof StartBanner>;

export const Default: Story = {};
