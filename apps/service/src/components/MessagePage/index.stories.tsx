import type { Meta, StoryObj } from "@storybook/react";
import MessagePage from ".";

const meta = {
  title: "Components/MessagePage",
  component: MessagePage,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    title: {
      control: "text",
      description: "ページのタイトル",
    },
    showBackButton: {
      control: "boolean",
      description: "トップページに戻るボタンを表示するか",
    },
  },
} satisfies Meta<typeof MessagePage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "お知らせ",
    children: <p>現在メンテナンス中です。しばらくお待ちください。</p>,
  },
};

export const ShowBackButton: Story = {
  args: {
    title: "ページが見つかりません",
    children: <p>お探しのページは存在しないか、削除された可能性があります。</p>,
    showBackButton: true,
  },
};

export const WithLongMessage: Story = {
  args: {
    title: "アカウントが作成されました",
    children: (
      <div className="max-w-md space-y-2">
        <p>アカウントの作成が完了しました。</p>
        <p>ご登録いただいたメールアドレスに確認メールを送信しました。</p>
        <p>メールに記載されているリンクをクリックして、アカウントを有効化してください。</p>
      </div>
    ),
    showBackButton: true,
  },
};
