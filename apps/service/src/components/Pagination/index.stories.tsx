import type { Meta, StoryObj } from "@storybook/react";
import Pagination from ".";

const meta = {
  title: "Components/Pagination",
  component: Pagination,
  tags: ["autodocs"],
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    currentPage: 3,
    totalPages: 8,
  },
};
