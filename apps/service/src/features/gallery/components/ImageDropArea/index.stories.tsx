import type { Meta, StoryObj } from "@storybook/react";
import ImageDropArea from "./";

const meta = {
  title: "Gallery/ImageDropArea",
  component: ImageDropArea,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
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
