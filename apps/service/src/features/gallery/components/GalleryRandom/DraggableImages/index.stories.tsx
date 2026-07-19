import type { Meta, StoryObj } from "@storybook/react";
import DraggableImages from "./";

const generateImages = (count: number) =>
  Array.from({ length: count }, (_, i) => {
    const isVertical = i % 3 !== 1;
    return {
      id: String(i + 1),
      src: isVertical ? "https://placehold.jp/400x600.png" : "https://placehold.jp/600x400.png",
      alt: `画像${i + 1}`,
      width: isVertical ? 400 : 600,
      height: isVertical ? 600 : 400,
      linkParams: { userSlug: "test", imageId: String(i + 1) },
    };
  });

const meta = {
  title: "UserPage/GalleryView/Random/DraggableImages",
  component: DraggableImages,
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
          userSlug: "test",
          imageId: "1",
        },
      },
    ],
    isScattering: false,
    onScatterComplete: () => {},
  },
} satisfies Meta<typeof DraggableImages>;

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
          userSlug: "test",
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
          userSlug: "test",
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
          userSlug: "test",
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
          userSlug: "test",
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

export const Scattering: Story = {
  args: {
    isScattering: true,
  },
};

export const ManyImages: Story = {
  args: {
    images: generateImages(15),
  },
};

export const EmptyImages: Story = {
  args: {
    images: [],
  },
};
