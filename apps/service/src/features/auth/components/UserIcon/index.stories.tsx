import type { Meta, StoryObj } from "@storybook/react";
import UserIcon from "./";

const meta = {
  title: "User/UserIcon",
  component: UserIcon,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof UserIcon>;

export default meta;

type Story = StoryObj<typeof UserIcon>;

export const Default: Story = {
  args: {
    userId: "user123",
    username: "ユーザー名",
  },
};
