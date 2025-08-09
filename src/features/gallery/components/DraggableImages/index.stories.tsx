import type { Meta, StoryObj } from "@storybook/react";
import DraggableImages from "./";

const meta = {
  title: "Gallery/DraggableImages",
  component: DraggableImages,
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
} satisfies Meta<typeof DraggableImages>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: [
      {
        src: "https://placehold.jp/400x600.png",
        alt: "縦長の画像サンプル1",
        width: 400,
        height: 600,
        linkHref: "/photo/1",
      },
      {
        src: "https://placehold.jp/600x400.png",
        alt: "横長の画像サンプル1",
        width: 600,
        height: 400,
        linkHref: "/photo/2",
      },
      {
        src: "https://placehold.jp/500x500.png",
        alt: "正方形の画像サンプル",
        width: 500,
        height: 500,
        linkHref: "/photo/3",
      },
      {
        src: "https://placehold.jp/300x450.png",
        alt: "縦長の画像サンプル2",
        width: 300,
        height: 450,
        linkHref: "/photo/4",
      },
      {
        src: "https://placehold.jp/700x350.png",
        alt: "横長の画像サンプル2",
        width: 700,
        height: 350,
        linkHref: "/photo/5",
      },
    ],
  },
};
