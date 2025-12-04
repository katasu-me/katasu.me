import type { Meta, StoryObj } from "@storybook/react";
import ExternalLink from ".";

const meta: Meta<typeof ExternalLink> = {
  title: "Components/ExternalLink",
  component: ExternalLink,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    href: { control: "text" },
    children: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    href: "https://example.com",
    children: "外部リンク",
  },
};
