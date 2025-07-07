import type { Meta, StoryObj } from "@storybook/react";
import Link from ".";

const meta: Meta<typeof Link> = {
  title: "Components/Link",
  component: Link,
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
