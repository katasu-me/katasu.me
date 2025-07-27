import type { Meta, StoryObj } from "@storybook/react";
import Pagination from ".";

const meta = {
  title: "Components/Pagination",
  component: Pagination,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    currentPage: { control: "number" },
    totalPages: { control: "number" },
  },
  args: {
    pathname: "/",
    searchParams: new URLSearchParams(),
  },
  decorators: [(Story) => <div suppressHydrationWarning>{Story()}</div>],
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    currentPage: 5,
    totalPages: 10,
  },
};

export const FewPages: Story = {
  args: {
    currentPage: 2,
    totalPages: 3,
  },
};

export const ManyPages: Story = {
  args: {
    currentPage: 10,
    totalPages: 20,
  },
};

export const SinglePage: Story = {
  args: {
    currentPage: 1,
    totalPages: 1,
  },
};

export const FirstPage: Story = {
  args: {
    currentPage: 1,
    totalPages: 10,
  },
};

export const MiddlePage: Story = {
  args: {
    currentPage: 5,
    totalPages: 10,
  },
};

export const LastPage: Story = {
  args: {
    currentPage: 10,
    totalPages: 10,
  },
};

export const WithCustomStyle: Story = {
  args: {
    currentPage: 3,
    totalPages: 10,
  },
  render: (args) => (
    <div className="bg-gray-100 p-8">
      <Pagination {...args} />
    </div>
  ),
};
