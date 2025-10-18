import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import Button from "@/components/Button";
import SeeyouSoonDrawer from "./";

const meta = {
  title: "Settings/SeeyouSoonDrawer",
  component: SeeyouSoonDrawer,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof SeeyouSoonDrawer>;

export default meta;

type Story = StoryObj<typeof SeeyouSoonDrawer>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setOpen(true)}>開く</Button>
        <SeeyouSoonDrawer open={open} onOpenChange={setOpen} />
      </>
    );
  },
};
