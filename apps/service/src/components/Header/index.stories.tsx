import type { PublicUserData } from "@katasu.me/service-db";
import type { Meta, StoryObj } from "@storybook/react";
import Header from ".";

const mockUser: PublicUserData = {
  id: "user123",
  name: "テストユーザー",
  customUrl: null,
  hasAvatar: false,
  plan: {
    maxPhotos: 1000,
  },
  bannedAt: null,
  avatarSetAt: null,
  termsAgreedAt: new Date(),
  privacyPolicyAgreedAt: new Date(),
};

const mockUserWithAvatar: PublicUserData = {
  id: "user456",
  name: "アバター付きユーザー",
  customUrl: "avatar-user",
  hasAvatar: true,
  plan: {
    maxPhotos: 1000,
  },
  bannedAt: null,
  avatarSetAt: new Date(),
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

export const WithSessionUser: Story = {
  args: {
    user: mockUser,
    sessionUserId: "logged-in-user",
  },
};

export const OwnerPage: Story = {
  args: {
    user: mockUser,
    sessionUserId: "user123", // mockUser.idと同じ
  },
};

export const WithAvatar: Story = {
  args: {
    user: mockUserWithAvatar,
    sessionUserId: "user456", // mockUserWithAvatar.idと同じ
  },
};

export const VisitorView: Story = {
  args: {
    user: mockUserWithAvatar,
    sessionUserId: "other-user", // 異なるユーザーID
  },
};
