import type { Meta, StoryObj } from "@storybook/react";
import UserIcon from "./";

const meta = {
  title: "Components/UserIcon",
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
    src: "https://avatars.githubusercontent.com/u/44780846?v=4",
    alt: "ユーザー",
    children: "arrow2nd",
  },
};
