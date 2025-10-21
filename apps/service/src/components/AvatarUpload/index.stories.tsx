import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import AvatarUpload from ".";

const meta = {
  title: "Components/AvatarUpload",
  component: AvatarUpload,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof AvatarUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [file, setFile] = useState<File | null>(null);

    return (
      <div>
        <AvatarUpload {...args} onFileChange={setFile} />
        {file && <p className="mt-4 text-sm text-warm-black/60">選択されたファイル: {file.name}</p>}
      </div>
    );
  },
};

export const WithDefaultAvatar: Story = {
  render: (args) => {
    const [file, setFile] = useState<File | null>(null);

    return (
      <div>
        <AvatarUpload {...args} onFileChange={setFile} />
        {file && <p className="mt-4 text-sm text-warm-black/60">選択されたファイル: {file.name}</p>}
      </div>
    );
  },
  args: {
    defaultAvatarUrl: "https://placehold.jp/200x200.png",
  },
};

export const WithError: Story = {
  render: (args) => {
    const [_file, setFile] = useState<File | null>(null);

    return (
      <div>
        <AvatarUpload {...args} onFileChange={setFile} />
      </div>
    );
  },
  args: {
    error: "ファイルサイズは5MB以下にしてください",
  },
};

export const Disabled: Story = {
  render: (args) => {
    const [_file, setFile] = useState<File | null>(null);

    return (
      <div>
        <AvatarUpload {...args} onFileChange={setFile} />
      </div>
    );
  },
  args: {
    disabled: true,
  },
};
