import type { Meta, StoryObj } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Button from "@/components/Button";
import { UploadProvider, useUpload } from "../../contexts/UploadContext";
import UploadDrawer from "./";

const queryClient = new QueryClient();

const meta = {
  title: "UserPage/UserImageDropArea/UploadDrawer",
  component: UploadDrawer,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <UploadProvider>
          <Story />
        </UploadProvider>
      </QueryClientProvider>
    ),
  ],
} satisfies Meta<typeof UploadDrawer>;

export default meta;

type Story = StoryObj<typeof UploadDrawer>;

function OpenButton() {
  const { openDrawer } = useUpload();
  return (
    <Button
      onClick={() =>
        openDrawer({
          counter: { total: 5, max: 100 },
        })
      }
    >
      開く
    </Button>
  );
}

export const Default: Story = {
  render: () => (
    <>
      <OpenButton />
      <UploadDrawer />
    </>
  ),
};
