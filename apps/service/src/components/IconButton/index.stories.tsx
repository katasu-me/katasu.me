import type { Meta, StoryObj } from "@storybook/react";
import IconSearch from "@/assets/icons/search.svg?react";
import IconButton from ".";

const meta = {
  title: "Components/IconButton",
  component: IconButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <IconSearch width={24} height={24} />,
  },
};
