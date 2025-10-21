import type { PublicUserData } from "@katasu.me/service-db";
import type { Meta, StoryObj } from "@storybook/react";
import Header from ".";

const mockUser: PublicUserData = {
  id: "user123",
  name: "テストユーザー",
  hasAvatar: false,
  plan: {
    maxPhotos: 1000,
  },
  bannedAt: null,
  termsAgreedAt: new Date(),
  privacyPolicyAgreedAt: new Date(),
};

const mockUserWithAvatar: PublicUserData = {
  id: "user456",
  name: "アバター付きユーザー",
  hasAvatar: true,
  plan: {
    maxPhotos: 1000,
  },
  bannedAt: null,
  termsAgreedAt: new Date(),
  privacyPolicyAgreedAt: new Date(),
};

const meta = {
  title: "Components/Header",
  component: Header,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    showRightMenu: {
      control: "boolean",
      description: "右側のメニューを表示するか",
    },
    isOwnerPage: {
      control: "boolean",
      description: "オーナーのページかどうか",
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-screen-lg">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    user: mockUser,
  },
};

export const WithRightMenu: Story = {
  args: {
    user: mockUser,
    showRightMenu: true,
  },
};

export const OwnerPage: Story = {
  args: {
    user: mockUser,
    showRightMenu: true,
    isOwnerPage: true,
  },
};

export const WithAvatar: Story = {
  args: {
    user: mockUserWithAvatar,
    showRightMenu: true,
    isOwnerPage: true,
  },
};

export const VisitorView: Story = {
  args: {
    user: mockUserWithAvatar,
    showRightMenu: true,
    isOwnerPage: false,
  },
};
