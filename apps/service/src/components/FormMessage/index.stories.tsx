import type { Meta, StoryObj } from "@storybook/react";
import FormMessage from ".";

const meta = {
  title: "Components/FormMessage",
  component: FormMessage,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof FormMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ErrorMessage: Story = {
  args: {
    type: "error",
    text: "入力内容にエラーがあります",
  },
};

export const Success: Story = {
  args: {
    type: "success",
    text: "変更が正常に保存されました",
  },
};

export const ValidationError: Story = {
  args: {
    type: "error",
    text: "メールアドレスの形式が正しくありません",
  },
};

export const WithCaption: Story = {
  args: {
    type: "error",
    text: "このフィールドは必須です。",
    caption: "正しい値を入力してください。入力可能な文字数は最大100文字までです。",
  },
};
