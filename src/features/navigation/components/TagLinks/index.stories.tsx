import type { Meta, StoryObj } from "@storybook/react";
import TagLinks from ".";

const meta: Meta<typeof TagLinks> = {
  title: "Navigation/TagLinks",
  component: TagLinks,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    tags: { control: "object" },
    className: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    tags: [
      { name: "画像", href: "/user/arrow2nd/tag/画像" },
      { name: "イラスト", href: "/user/arrow2nd/tag/イラスト" },
      { name: "風景", href: "/user/arrow2nd/tag/風景" },
    ],
  },
};

export const SingleTag: Story = {
  args: {
    tags: [{ name: "画像", href: "/user/arrow2nd/tag/画像" }],
  },
};

export const ManyTags: Story = {
  args: {
    tags: [
      { name: "画像", href: "/user/arrow2nd/tag/画像" },
      { name: "イラスト", href: "/user/arrow2nd/tag/イラスト" },
      { name: "風景", href: "/user/arrow2nd/tag/風景" },
      { name: "ポートレート", href: "/user/arrow2nd/tag/ポートレート" },
      { name: "モノクロ", href: "/user/arrow2nd/tag/モノクロ" },
      { name: "夕焼け", href: "/user/arrow2nd/tag/夕焼け" },
      { name: "海", href: "/user/arrow2nd/tag/海" },
      { name: "山", href: "/user/arrow2nd/tag/山" },
    ],
  },
};
