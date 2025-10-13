import type { Meta, StoryObj } from "@storybook/react";
import TagLinks from ".";

const meta: Meta<typeof TagLinks> = {
  title: "Navigation/TagLinks",
  component: TagLinks,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    tags: [
      {
        id: "1",
        name: "画像",
        userId: "test",
      },
      {
        id: "2",
        name: "イラスト",
        userId: "test",
      },
      {
        id: "3",
        name: "風景",
        userId: "test",
      },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Warp: Story = {
  render: (args) => (
    <div style={{ width: "250px", border: "1px solid #ccc", padding: "10px" }}>
      <TagLinks {...args} />
    </div>
  ),
};

export const ManyTags: Story = {
  args: {
    tags: [
      { id: "1", name: "画像", userId: "test" },
      { id: "2", name: "イラスト", userId: "test" },
      { id: "3", name: "風景", userId: "test" },
      { id: "4", name: "ポートレート", userId: "test" },
      { id: "5", name: "モノクロ", userId: "test" },
      { id: "6", name: "夕焼け", userId: "test" },
      { id: "7", name: "海", userId: "test" },
      { id: "8", name: "山", userId: "test" },
    ],
  },
};
