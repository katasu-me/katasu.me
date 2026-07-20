import type { Meta, StoryObj } from "@storybook/react";
import { css } from "styled-system/css";
import FrameImage from ".";

const meta = {
  title: "Components/FrameImage",
  component: FrameImage,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof FrameImage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    src: "https://placehold.co/640x480",
    alt: "サンプル画像",
    width: 640,
    height: 480,
    cssProps: css.raw({ w: "64" }),
  },
};

export const Processing: Story = {
  args: {
    alt: "処理中の画像",
    width: 640,
    height: 480,
    status: "processing",
    cssProps: css.raw({ w: "64" }),
  },
};
