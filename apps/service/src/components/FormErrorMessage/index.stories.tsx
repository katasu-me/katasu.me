import type { Meta, StoryObj } from "@storybook/react";
import FormErrorMessage from ".";

const meta = {
  title: "Components/FormErrorMessage",
  component: FormErrorMessage,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof FormErrorMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    text: "入力内容にエラーがあります",
  },
};

export const ValidationError: Story = {
  args: {
    text: "メールアドレスの形式が正しくありません",
  },
};

export const LongMessage: Story = {
  args: {
    text: "このフィールドは必須です。正しい値を入力してください。入力可能な文字数は最大100文字までです。",
  },
};
