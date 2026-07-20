import type { Meta, StoryObj } from "@storybook/react";
import { css } from "styled-system/css";
import GalleryMasonry from ".";

const meta = {
  title: "Features/Gallery/GalleryMasonry",
  component: GalleryMasonry,
  tags: ["autodocs"],
} satisfies Meta<typeof GalleryMasonry>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    currentPage: 1,
    totalImageCount: 4,
    cssProps: css.raw({ maxW: "4xl" }),
    images: [
      { id: "1", src: "https://placehold.co/480x640", alt: "1", width: 480, height: 640 },
      { id: "2", src: "https://placehold.co/640x480", alt: "2", width: 640, height: 480 },
      { id: "3", src: "https://placehold.co/480x720", alt: "3", width: 480, height: 720 },
      { id: "4", src: "https://placehold.co/640x640", alt: "4", width: 640, height: 640 },
    ],
  },
};
