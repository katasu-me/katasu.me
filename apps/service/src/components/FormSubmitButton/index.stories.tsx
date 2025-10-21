import type { Meta, StoryObj } from "@storybook/react";
import FormSubmitButton from ".";

const meta = {
  title: "Components/FormSubmitButton",
  component: FormSubmitButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof FormSubmitButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <form>
      <FormSubmitButton {...args} />
    </form>
  ),
  args: {
    label: "送信する",
    pendingLabel: "送信中…",
  },
};

export const Outline: Story = {
  render: (args) => (
    <form>
      <FormSubmitButton {...args} />
    </form>
  ),
  args: {
    label: "キャンセル",
    pendingLabel: "処理中…",
    variant: "outline",
  },
};

export const Danger: Story = {
  render: (args) => (
    <form>
      <FormSubmitButton {...args} />
    </form>
  ),
  args: {
    label: "削除する",
    pendingLabel: "削除中…",
    variant: "danger",
  },
};

export const Disabled: Story = {
  render: (args) => (
    <form>
      <FormSubmitButton {...args} />
    </form>
  ),
  args: {
    label: "送信する",
    pendingLabel: "送信中…",
    disabled: true,
  },
};
