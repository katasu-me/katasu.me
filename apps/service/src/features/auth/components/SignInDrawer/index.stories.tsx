import type { Meta, StoryObj } from "@storybook/react";
import Button from "@/components/Button";
import SignInDrawer from "./index";

const meta = {
  title: "App/SignInDrawer",
  component: SignInDrawer,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof SignInDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <SignInDrawer>
      <Button>はじめる</Button>
    </SignInDrawer>
  ),
};

export const WithOutlineButton: Story = {
  render: () => (
    <SignInDrawer>
      <Button variant="outline">ログイン</Button>
    </SignInDrawer>
  ),
};
