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
    totalCount: 5,
  },
};

export const ZeroCount: Story = {
  args: {
    totalCount: 0,
  },
};

export const OneRemaining: Story = {
  args: {
    totalCount: 10,
  },
};

export const MidCount: Story = {
  args: {
    totalCount: 30,
  },
};

export const LargeNumbers: Story = {
  args: {
    totalCount: 50,
  },
};
