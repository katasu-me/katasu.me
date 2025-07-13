import type { Meta, StoryObj } from "@storybook/react";
import TextLink from ".";

const meta: Meta<typeof TextLink> = {
  title: "Components/Link",
  component: TextLink,
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
    href: "/example",
    children: "リンクテキスト",
  },
};

export const ExternalLink: Story = {
  args: {
    href: "https://example.com",
    children: "外部リンク",
  },
};
