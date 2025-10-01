/** biome-ignore-all lint/correctness/useUniqueElementIds: Storybookなので */
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import Input from ".";

const meta = {
  title: "Shared/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    maxLength: { control: "number" },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "タイトルを入力",
    maxLength: 100,
  },
  render: ({ placeholder, maxLength, disabled }) => {
    const [value, setValue] = useState("");
    return (
      <div className="w-80">
        <Input
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          value={value}
          currentLength={value.length}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
    );
  },
};

export const WithLabel: Story = {
  args: {
    label: "タイトル",
    placeholder: "タイトルを入力",
    maxLength: 50,
  },
  render: ({ label, placeholder, maxLength, disabled }) => {
    const [value, setValue] = useState("");
    return (
      <div className="w-80">
        <Input
          id="title-input"
          label={label}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          currentLength={value.length}
        />
      </div>
    );
  },
};

export const WithoutCounter: Story = {
  args: {
    placeholder: "カウンターなしの入力",
  },
  render: ({ placeholder, disabled }) => {
    const [value, setValue] = useState("");
    return (
      <div className="w-80">
        <Input placeholder={placeholder} disabled={disabled} value={value} onChange={(e) => setValue(e.target.value)} />
      </div>
    );
  },
};

export const Disabled: Story = {
  args: {
    placeholder: "無効な入力",
    disabled: true,
    maxLength: 100,
    value: "編集できません",
    currentLength: 7,
  },
};

export const WithInitialValue: Story = {
  args: {
    placeholder: "タイトルを入力",
    maxLength: 100,
  },
  render: ({ placeholder, maxLength, disabled }) => {
    const [value, setValue] = useState("初期値のあるテキスト");
    return (
      <div className="w-80">
        <Input
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          currentLength={value.length}
        />
      </div>
    );
  },
};

export const WithError: Story = {
  args: {
    label: "タイトル",
    placeholder: "タイトルを入力",
    maxLength: 50,
    error: "タイトルは必須です",
  },
  render: ({ label, placeholder, maxLength, error, disabled }) => {
    const [value, setValue] = useState("");
    return (
      <div className="w-80">
        <Input
          id="title-input"
          label={label}
          placeholder={placeholder}
          maxLength={maxLength}
          error={error}
          disabled={disabled}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          currentLength={value.length}
        />
      </div>
    );
  },
};
