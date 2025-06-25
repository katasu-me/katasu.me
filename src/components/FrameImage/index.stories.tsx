import type { Meta, StoryObj } from "@storybook/react";
import FrameImage from "./index";

const dummyImageDataUrl =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

const meta = {
  title: "Components/FrameImage",
  component: FrameImage,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    src: {
      control: "text",
      description: "画像のソース",
    },
    alt: {
      control: "text",
      description: "画像の代替テキスト",
    },
    width: {
      control: "number",
      description: "画像の幅",
    },
    height: {
      control: "number",
      description: "画像の高さ",
    },
    className: {
      control: "text",
      description: "追加のCSSクラス",
    },
    title: {
      control: "text",
      description: "画像のタイトル",
    },
  },
  args: {
    src: dummyImageDataUrl,
    alt: "サンプル画像",
    width: 300,
    height: 200,
  },
} satisfies Meta<typeof FrameImage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Square: Story = {
  args: {
    alt: "正方形の画像",
    width: 250,
    height: 250,
  },
};

export const Portrait: Story = {
  args: {
    alt: "縦長の画像",
    width: 200,
    height: 300,
  },
};

export const Small: Story = {
  args: {
    alt: "小さい画像",
    width: 100,
    height: 100,
  },
};

export const Large: Story = {
  args: {
    alt: "大きい画像",
    width: 500,
    height: 300,
  },
};

export const WithTitle: Story = {
  args: {
    title: "画像のタイトル",
  },
};
