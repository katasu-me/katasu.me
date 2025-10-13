import type { Meta, StoryObj } from "@storybook/react";
import Random from "./";

const meta = {
  title: "Gallery/DraggableImages",
  component: Random,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Random>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    images: [
      {
        src: "https://placehold.jp/400x600.png",
        alt: "縦長の画像サンプル1",
        width: 400,
        height: 600,
        linkParams: {
          userId: "test",
          imageId: "1",
        },
      },
      {
        src: "https://placehold.jp/600x400.png",
        alt: "横長の画像サンプル1",
        width: 600,
        height: 400,
        linkParams: {
          userId: "test",
          imageId: "2",
        },
      },
      {
        src: "https://placehold.jp/500x500.png",
        alt: "正方形の画像サンプル",
        width: 500,
        height: 500,
        linkParams: {
          userId: "test",
          imageId: "3",
        },
      },
      {
        src: "https://placehold.jp/300x450.png",
        alt: "縦長の画像サンプル2",
        width: 300,
        height: 450,
        linkParams: {
          userId: "test",
          imageId: "4",
        },
      },
      {
        src: "https://placehold.jp/700x350.png",
        alt: "横長の画像サンプル2",
        width: 700,
        height: 350,
        linkParams: {
          userId: "test",
          imageId: "5",
        },
      },
    ],
  },
};
