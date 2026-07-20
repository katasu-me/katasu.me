import type { Meta, StoryObj } from "@storybook/react";
import UserIcon from ".";

const meta = {
  title: "Components/Header/UserIcon",
  component: UserIcon,
  tags: ["autodocs"],
} satisfies Meta<typeof UserIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    userSlug: "katasu",
    username: "かたす",
  },
};
