import type { Meta, StoryObj } from "@storybook/react";
import TagLinks from ".";

const meta: Meta<typeof TagLinks> = {
  title: "Components/TagLinks",
  component: TagLinks,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    userSlug: "test-user",
    tags: [
      {
        id: "1",
        name: "画像",
      },
      {
        id: "2",
        name: "イラスト",
      },
      {
        id: "3",
        name: "風景",
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
      { id: "1", name: "画像" },
      { id: "2", name: "イラスト" },
      { id: "3", name: "風景" },
      { id: "4", name: "ポートレート" },
      { id: "5", name: "モノクロ" },
      { id: "6", name: "夕焼け" },
      { id: "7", name: "海" },
      { id: "8", name: "山" },
    ],
  },
};
