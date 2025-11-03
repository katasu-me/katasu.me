import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import Button from "@/components/Button";
import UploadDrawer from "./";

const meta = {
  title: "UserPage/UserImageDropArea/UploadDrawer",
  component: UploadDrawer,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof UploadDrawer>;

export default meta;

type Story = StoryObj<typeof UploadDrawer>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setOpen(true)}>開く</Button>
        <UploadDrawer
          open={open}
          onOpenChange={setOpen}
          counter={{
            total: 5,
            max: 100,
          }}
        />
      </>
    );
  },
};
