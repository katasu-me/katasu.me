import type { Meta, StoryObj } from "@storybook/react";
import Footer from "./";

const meta = {
  title: "Layout/Footer",
  component: Footer,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Footer>;

export default meta;

type Story = StoryObj<typeof Footer>;

export const LoggedInUser: Story = {
  args: {
    mode: "logged-in-user",
  },
};

export const WithDevelopedBy: Story = {
  args: {
    mode: "developed-by",
  },
};
