import type { Meta, StoryObj } from "@storybook/react";
import Header from ".";

const meta = {
  title: "Components/Header",
  component: Header,
  tags: ["autodocs"],
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    user: {
      id: "user_1",
      name: "かたす",
      customUrl: "katasu",
      plan: { maxPhotos: 100 },
      hasAvatar: false,
      avatarSetAt: null,
      bannedAt: null,
      termsAgreedAt: new Date("2026-01-01"),
      privacyPolicyAgreedAt: new Date("2026-01-01"),
    },
  },
};
