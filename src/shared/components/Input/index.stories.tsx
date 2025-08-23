/** biome-ignore-all lint/nursery/useUniqueElementIds: Storybookなので  */
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
  render: (args) => {
    const [value, setValue] = useState("");
    return (
      <div className="w-80">
        <Input {...args} value={value} onChange={(e) => setValue(e.target.value)} currentLength={value.length} />
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
  render: (args) => {
    const [value, setValue] = useState("");
    return (
      <div className="w-80">
        <Input
          {...args}
          id="title-input"
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
  render: (args) => {
    const [value, setValue] = useState("");
    return (
      <div className="w-80">
        <Input {...args} value={value} onChange={(e) => setValue(e.target.value)} />
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
  render: (args) => {
    const [value, setValue] = useState("初期値のあるテキスト");
    return (
      <div className="w-80">
        <Input {...args} value={value} onChange={(e) => setValue(e.target.value)} currentLength={value.length} />
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
  render: (args) => {
    const [value, setValue] = useState("");
    return (
      <div className="w-80">
        <Input
          {...args}
          id="title-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          currentLength={value.length}
        />
      </div>
    );
  },
};
