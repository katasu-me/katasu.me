import type { Meta, StoryObj } from "@storybook/react";
import DevelopedBy from "./";

const meta = {
  title: "Components/Footer/DevelopedBy",
  component: DevelopedBy,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DevelopedBy>;

export default meta;

type Story = StoryObj<typeof DevelopedBy>;

export const Default: Story = {};
