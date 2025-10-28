import type { Meta, StoryObj } from "@storybook/react";
import { useRef } from "react";
import DraggableImage from "./";

const meta = {
  title: "UserPage/GalleryView/Random/DraggableImage",
  component: DraggableImage,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    item: {
      src: "https://placehold.jp/400x600.png",
      alt: "ドラッグ可能な画像",
      width: 400,
      height: 600,
      linkParams: {
        userId: "test",
        imageId: "1",
      },
    },
    initialPosition: { x: 0, y: 0, rotation: 0 },
    delay: 0,
    containerRef: { current: null },
    maxZIndex: { current: 2 },
  },
  render: (args) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const maxZIndex = useRef(2);

    return (
      <div
        ref={containerRef}
        style={{
          width: "100vw",
          height: "100vh",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <DraggableImage {...args} containerRef={containerRef} maxZIndex={maxZIndex} />
      </div>
    );
  },
} satisfies Meta<typeof DraggableImage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    initialPosition: { x: 0, y: 0, rotation: 0 },
    delay: 0,
  },
};

export const WithRotation: Story = {
  args: {
    initialPosition: { x: 0, y: 0, rotation: 45 },
    delay: 0,
  },
};

export const OffsetPosition: Story = {
  args: {
    initialPosition: { x: -200, y: -100, rotation: -15 },
    delay: 0,
  },
};

export const HorizontalImage: Story = {
  args: {
    item: {
      src: "https://placehold.jp/600x400.png",
      alt: "横長の画像",
      width: 600,
      height: 400,
      linkParams: {
        userId: "test",
        imageId: "2",
      },
    },
    initialPosition: { x: 0, y: 0, rotation: 0 },
    delay: 0,
  },
};

export const WithDelay: Story = {
  args: {
    initialPosition: { x: 0, y: 0, rotation: 0 },
    delay: 1,
  },
};
