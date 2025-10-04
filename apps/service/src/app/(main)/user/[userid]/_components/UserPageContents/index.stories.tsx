import type { User } from "@katasu.me/service-db";
import type { Meta, StoryObj } from "@storybook/react";
import Message from "@/components/Message";
import UserPageLayout from "./index";

const mockUser: User = {
  id: "test-user-id",
  name: "テストユーザー",
  email: "test@example.com",
  emailVerified: true,
  hasAvatar: true,
  plan: "free",
  maxPhotos: 1000,
  uploadedPhotos: 42,
  isBanned: false,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

const mockTags = [
  {
    name: "風景",
    userId: "test-user-id",
  },
  {
    name: "ポートレート",
    userId: "test-user-id",
  },
  {
    name: "空間",
    userId: "test-user-id",
  },
];

const meta = {
  title: "Pages/User/UserPageLayout",
  component: UserPageLayout,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="grid grid-cols-[1fr_min(56rem,100%)_1fr] px-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof UserPageLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithEmptyState: Story = {
  args: {
    user: mockUser,
    tags: mockTags,
    children: <Message message="からっぽです" />,
  },
};

export const WithContent: Story = {
  args: {
    user: mockUser,
    tags: mockTags,
    children: (
      <div className="col-start-2 rounded-lg bg-neutral-100 p-8 text-center">
        <p>ここにギャラリービューが表示されます</p>
      </div>
    ),
  },
};

export const WithoutTags: Story = {
  args: {
    user: mockUser,
    tags: [],
    children: <Message message="からっぽです" />,
  },
};

export const WithLongUserName: Story = {
  args: {
    user: {
      ...mockUser,
      name: "とても長いユーザー名を持つテストユーザーのアカウント",
    },
    tags: mockTags,
    children: <Message message="からっぽです" />,
  },
};
