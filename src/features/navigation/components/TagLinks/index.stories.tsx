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
      { name: "画像", href: "/user/arrow2nd/tag/画像", image: "https://placehold.jp/960x64.png" },
      { name: "イラスト", href: "/user/arrow2nd/tag/イラスト", image: "https://placehold.jp/96x64.png" },
      { name: "風景", href: "/user/arrow2nd/tag/風景", image: "https://placehold.jp/96x64.png" },
    ],
  },
};

export const SingleTag: Story = {
  args: {
    tags: [{ name: "画像", href: "/user/arrow2nd/tag/画像", image: "https://placehold.jp/96x64.png" }],
  },
};

export const ManyTags: Story = {
  args: {
    tags: [
      { name: "画像", href: "/user/arrow2nd/tag/画像", image: "https://placehold.jp/96x64.png" },
      { name: "イラスト", href: "/user/arrow2nd/tag/イラスト", image: "https://placehold.jp/96x64.png" },
      { name: "風景", href: "/user/arrow2nd/tag/風景", image: "https://placehold.jp/96x64.png" },
      { name: "ポートレート", href: "/user/arrow2nd/tag/ポートレート", image: "https://placehold.jp/96x64.png" },
      { name: "モノクロ", href: "/user/arrow2nd/tag/モノクロ", image: "https://placehold.jp/96x64.png" },
      { name: "夕焼け", href: "/user/arrow2nd/tag/夕焼け", image: "https://placehold.jp/96x64.png" },
      { name: "海", href: "/user/arrow2nd/tag/海", image: "https://placehold.jp/96x64.png" },
      { name: "山", href: "/user/arrow2nd/tag/山", image: "https://placehold.jp/96x64.png" },
    ],
  },
};
