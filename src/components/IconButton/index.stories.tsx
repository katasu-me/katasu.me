import type { Meta, StoryObj } from "@storybook/react";
import IconButton from "./";

const meta = {
  title: "Components/IconButton",
  component: IconButton,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    iconName: {
      control: "select",
      options: ["search", "settings", "flag"],
      description: "表示するアイコンの種類",
    },
  },
} satisfies Meta<typeof IconButton>;

export default meta;

type Story = StoryObj<typeof IconButton>;

export const Search: Story = {
  args: {
    iconName: "search",
  },
};

export const Settings: Story = {
  args: {
    iconName: "settings",
  },
};

export const Flag: Story = {
  args: {
    iconName: "flag",
  },
};

export const AllIcons: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1rem" }}>
      <IconButton iconName="search" />
      <IconButton iconName="settings" />
      <IconButton iconName="flag" />
    </div>
  ),
};
