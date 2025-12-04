import type { Meta, StoryObj } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UploadProvider } from "../../contexts/UploadContext";
import ImageDropArea from "./";

const queryClient = new QueryClient();

const meta = {
  title: "UserPage/UserImageDropArea/ImageDropArea",
  component: ImageDropArea,
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
  args: {
    counter: {
      total: 5,
      max: 100,
    },
  },
  argTypes: {
    title: {
      control: "text",
      description: "ドロップエリアに表示するタイトル",
    },
    className: {
      control: "text",
      description: "追加のCSSクラス",
    },
  },
} satisfies Meta<typeof ImageDropArea>;

export default meta;

type Story = StoryObj<typeof ImageDropArea>;

export const Default: Story = {
  args: {
    title: "新しい画像を投稿する",
  },
};

export const Upload: Story = {
  args: {
    title: "画像をアップロード",
  },
};

export const DragAndDrop: Story = {
  args: {
    title: "ここに画像をドラッグ＆ドロップ",
  },
};

export const WithCustomStyle: Story = {
  args: {
    title: "カスタムスタイル付き",
  },
  decorators: [
    (Story) => (
      <div style={{ width: "600px", height: "400px" }}>
        <Story />
      </div>
    ),
  ],
};
