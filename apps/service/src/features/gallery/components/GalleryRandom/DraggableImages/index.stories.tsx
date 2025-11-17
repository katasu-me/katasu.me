import type { Meta, StoryObj } from "@storybook/react";
import DraggableImageStack from "./";

const meta = {
  title: "UserPage/GalleryView/Random/DraggableImage",
  component: DraggableImageStack,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    images: [
      {
        id: "1",
        src: "https://placehold.jp/400x600.png",
        alt: "ドラッグ可能な画像",
        width: 400,
        height: 600,
        linkParams: {
          userId: "test",
          imageId: "1",
        },
      },
    ],
    isLoading: false,
  },
} satisfies Meta<typeof DraggableImageStack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const MultipleImages: Story = {
  args: {
    images: [
      {
        id: "1",
        src: "https://placehold.jp/400x600.png",
        alt: "縦長の画像1",
        width: 400,
        height: 600,
        linkParams: {
          userId: "test",
          imageId: "1",
        },
      },
      {
        id: "2",
        src: "https://placehold.jp/600x400.png",
        alt: "横長の画像1",
        width: 600,
        height: 400,
        linkParams: {
          userId: "test",
          imageId: "2",
        },
      },
      {
        id: "3",
        src: "https://placehold.jp/400x600.png",
        alt: "縦長の画像2",
        width: 400,
        height: 600,
        linkParams: {
          userId: "test",
          imageId: "3",
        },
      },
    ],
  },
};

export const HorizontalImage: Story = {
  args: {
    images: [
      {
        id: "1",
        src: "https://placehold.jp/600x400.png",
        alt: "横長の画像",
        width: 600,
        height: 400,
        linkParams: {
          userId: "test",
          imageId: "1",
        },
      },
    ],
  },
};

export const WithoutLink: Story = {
  args: {
    images: [
      {
        id: "1",
        src: "https://placehold.jp/400x600.png",
        alt: "リンクなし画像",
        width: 400,
        height: 600,
      },
    ],
  },
};

export const WithLoading: Story = {
  args: {
    images: [],
    isLoading: true,
  },
};

export const WithError: Story = {
  args: {
    images: [],
    error: "画像の読み込みに失敗しました",
  },
};
