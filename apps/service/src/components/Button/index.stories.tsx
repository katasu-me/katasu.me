import type { Meta, StoryObj } from "@storybook/react";
import Button from ".";

const meta = {
  title: "Components/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["outline", "fill"],
    },
    disabled: {
      control: { type: "boolean" },
    },
    asChild: {
      control: { type: "boolean" },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Outline: Story = {
  args: {
    variant: "outline",
    children: "ボタン",
  },
};

export const Fill: Story = {
  args: {
    variant: "fill",
    children: "ボタン",
  },
};

export const OutlineDisabled: Story = {
  args: {
    variant: "outline",
    children: "ボタン",
    disabled: true,
  },
};

export const FillDisabled: Story = {
  args: {
    variant: "fill",
    children: "ボタン",
    disabled: true,
  },
};

export const AsChildExample: Story = {
  args: {
    variant: "outline",
    asChild: true,
    children: <a href="/">リンクボタン</a>,
  },
};

export const CustomClass: Story = {
  args: {
    variant: "fill",
    children: "カスタムスタイル",
    className: "px-16",
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <Button variant="outline">Outline</Button>
        <Button variant="fill">Fill</Button>
      </div>
      <div className="flex gap-4">
        <Button variant="outline" disabled>
          Outline Disabled
        </Button>
        <Button variant="fill" disabled>
          Fill Disabled
        </Button>
      </div>
    </div>
  ),
};
