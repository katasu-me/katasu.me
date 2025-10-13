import type { Meta, StoryObj } from "@storybook/react";
import FilmCounter from ".";

const meta = {
  title: "features/gallery/FilmCounter",
  component: FilmCounter,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    max: 1000,
  },
} satisfies Meta<typeof FilmCounter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    total: 5,
  },
};

export const ZeroCount: Story = {
  args: {
    total: 0,
  },
};

export const OneRemaining: Story = {
  args: {
    total: 10,
  },
};

export const MidCount: Story = {
  args: {
    total: 30,
  },
};

export const LargeNumbers: Story = {
  args: {
    total: 50,
  },
};
