import type { Meta, StoryObj } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UploadProvider } from "../../contexts/UploadContext";
import UploadForm from ".";

const queryClient = new QueryClient();

const meta = {
  title: "UserPage/UserImageDropArea/UploadDrawer/UploadForm",
  component: UploadForm,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    onPendingChange: console.log,
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <UploadProvider>
          <div className="w-80">
            <Story />
          </div>
        </UploadProvider>
      </QueryClientProvider>
    ),
  ],
} satisfies Meta<typeof UploadForm>;

export default meta;

type Story = StoryObj<typeof UploadForm>;

export const Default: Story = {};

export const WithTitle: Story = {
  args: {
    defaultTitle: "すてきな風景",
  },
};

export const WithTags: Story = {
  args: {
    defaultTags: ["風景", "夕焼け"],
  },
};

export const WithTitleAndTags: Story = {
  args: {
    defaultTitle: "すてきな風景",
    defaultTags: ["風景", "夕焼け"],
  },
};
