import type { Meta, StoryObj } from "@storybook/react";
import { StartButtonFallback } from "./index";

const meta = {
  title: "Auth/StartButton",
  component: StartButtonFallback,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof StartButtonFallback>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BeforeLogin: Story = {
  args: {
    user: undefined,
  },
};

export const AfterLogin: Story = {
  args: {
    user: {
      id: "exampleUserId",
      name: "Example User",
      plan: {
        maxPhotos: 1000,
      },
      hasAvatar: false,
      avatarSetAt: new Date(),
      bannedAt: null,
      termsAgreedAt: new Date(),
      privacyPolicyAgreedAt: new Date(),
    },
  },
};
