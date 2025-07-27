import type { Meta, StoryObj } from "@storybook/react";
import BudouX from ".";

const meta: Meta<typeof BudouX> = {
  title: "Components/BudouX",
  component: BudouX,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof BudouX>;

export const All: Story = {
  args: {
    children: "これはテストの文章です。適切な位置で改行されているはずです。",
  },
  render: (args) => {
    return (
      <>
        <p>w-32</p>
        <div style={{ width: "8rem", border: "1px solid #ef4444", backgroundColor: "white" }}>
          <BudouX {...args} />
        </div>
        <p style={{ marginTop: "1rem" }}>w-64</p>
        <div style={{ width: "16rem", border: "1px solid #ef4444", backgroundColor: "white" }}>
          <BudouX {...args} />
        </div>
      </>
    );
  },
};
