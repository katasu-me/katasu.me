import type { Meta, StoryObj } from "@storybook/react";
import { expect } from "@storybook/test";
import { userEvent, within } from "@storybook/testing-library";
import { type ComponentProps, useState } from "react";
import TagInput from ".";

const meta = {
  title: "shared/TagInput",
  component: TagInput,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof TagInput>;

export default meta;
type Story = StoryObj<typeof meta>;

const suggestTags = [
  "React",
  "Vue.js",
  "Angular",
  "Svelte",
  "Next.js",
  "Nuxt.js",
  "TypeScript",
  "JavaScript",
  "Tailwind CSS",
  "Styled Components",
  "Material-UI",
  "Chakra UI",
  "Ant Design",
  "Bootstrap",
  "Sass",
  "Less",
  "Webpack",
  "Vite",
  "Rollup",
  "Parcel",
];

const TagInputWithState = (args: ComponentProps<typeof TagInput>) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  return (
    <div className="w-96">
      <TagInput {...args} tags={selectedTags} onChange={setSelectedTags} />
      {selectedTags.length > 0 && (
        <div className="mt-4 rounded-lg bg-gray-50 p-4">
          <h3 className="mb-2 font-medium text-sm">選択されたタグ:</h3>
          <div className="space-y-1">
            {selectedTags.map((tag, index) => (
              <div key={`${tag}-${index.toString()}`} className="text-sm">
                {index + 1}. {tag}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const Default: Story = {
  render: (args) => <TagInputWithState {...args} />,
  args: {
    suggestTags,
    placeholder: "技術名を入力してください...",
  },
};

export const WithInitialValues: Story = {
  render: (args) => {
    const [selectedTags, setSelectedTags] = useState<string[]>(["React", "TypeScript", "Tailwind CSS"]);

    return (
      <div className="w-96">
        <TagInput {...args} tags={selectedTags} onChange={setSelectedTags} />
      </div>
    );
  },
  args: {
    suggestTags,
    placeholder: "技術名を入力してください...",
  },
};

export const CustomPlaceholder: Story = {
  render: (args) => <TagInputWithState {...args} />,
  args: {
    suggestTags,
    placeholder: "スキルを追加...",
  },
};

export const NoOptions: Story = {
  render: (args) => <TagInputWithState {...args} />,
  args: {
    suggestTags: [],
    placeholder: "オプションがありません",
  },
};

export const ManyOptions: Story = {
  render: (args) => <TagInputWithState {...args} />,
  args: {
    suggestTags: [
      ...suggestTags,
      "Node.js",
      "Express",
      "Fastify",
      "NestJS",
      "Django",
      "Flask",
      "Ruby on Rails",
      "Laravel",
      "Spring Boot",
      ".NET Core",
    ],
    placeholder: "技術名を入力してください...",
  },
};

// テスト用のコンポーネント
const TagInputTestComponent = ({
  initialTags = [],
  ...args
}: ComponentProps<typeof TagInput> & { initialTags?: string[] }) => {
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);

  return (
    <div className="w-96">
      <TagInput {...args} tags={selectedTags} onChange={setSelectedTags} />
      {selectedTags.length > 0 && (
        <div className="mt-4 rounded-lg bg-gray-50 p-4">
          <h3 className="mb-2 font-medium text-sm">選択されたタグ:</h3>
          <div className="space-y-1">
            {selectedTags.map((tag, index) => (
              <div key={`${tag}-${index.toString()}`} className="text-sm">
                {index + 1}. {tag}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const BasicInteraction: Story = {
  name: "サジェストから選択してタグを追加できる",
  render: (args) => <TagInputTestComponent {...args} />,
  args: {
    suggestTags,
    placeholder: "タグを入力してください...",
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");

    await step("プレースホルダーが表示されることを確認", async () => {
      await expect(canvas.getByPlaceholderText("タグを入力してください...")).toBeInTheDocument();
    });

    await step("入力してサジェストが表示される", async () => {
      await userEvent.type(input, "R");
      await expect(canvas.getByText("React")).toBeInTheDocument();
    });

    await step("ArrowDownで最初の項目を選択してEnterでタグを追加できる", async () => {
      await userEvent.keyboard("{ArrowDown}");
      await userEvent.keyboard("{Enter}");
      await expect(canvas.getByText("#React")).toBeInTheDocument();
    });
  },
};

// 存在しないタグは新しいタグとして追加される
export const NewTagAddition: Story = {
  name: "存在しないタグは新しいタグとして追加される",
  render: (args) => <TagInputTestComponent {...args} />,
  args: {
    suggestTags,
    placeholder: "新しいタグを追加可能",
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");

    await step("存在しないタグを入力して追加できる", async () => {
      await userEvent.type(input, "NewTag");
      await userEvent.keyboard("{Enter}");
      await expect(canvas.getByText("#NewTag")).toBeInTheDocument();
    });
  },
};

export const SpaceKeyAddition: Story = {
  name: "スペースキーでタグを選択できる",
  render: (args) => <TagInputTestComponent {...args} />,
  args: {
    suggestTags,
    placeholder: "スペースキーでも追加可能",
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");

    await step("スペースキーでタグを追加できる", async () => {
      await userEvent.type(input, "SpaceTag ");
      await expect(canvas.getByText("#SpaceTag")).toBeInTheDocument();
    });
  },
};

export const DuplicateAndEmptyTest: Story = {
  name: "重複タグが追加されない",
  render: (args) => <TagInputTestComponent {...args} initialTags={["React"]} />,
  args: {
    suggestTags,
    placeholder: "重複・空白テスト",
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");

    await step("既存タグが表示されることを確認", async () => {
      await expect(canvas.getByText("#React")).toBeInTheDocument();
    });

    await step("重複するタグは追加されない", async () => {
      await userEvent.type(input, "React");
      await userEvent.keyboard("{Enter}");
      const reactTags = canvas.getAllByText("#React");
      expect(reactTags).toHaveLength(1);
    });
  },
};

export const EmptyInputNoAddition: Story = {
  name: "空白入力ではタグが追加されない",
  render: (args) => <TagInputTestComponent {...args} />,
  args: {
    suggestTags,
    placeholder: "空白入力テスト",
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");

    await step("空白のみの入力ではタグが追加されない", async () => {
      await userEvent.type(input, "   ");
      await userEvent.keyboard("{Enter}");
      const tags = canvas.queryAllByText(/^#/);
      expect(tags).toHaveLength(0);
    });
  },
};

export const TagDeletion: Story = {
  name: "タグの削除ができる",
  render: (args) => <TagInputTestComponent {...args} initialTags={["React", "TypeScript"]} />,
  args: {
    suggestTags,
    placeholder: "削除テスト",
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");

    await step("初期状態で2つのタグが表示されている", async () => {
      await expect(canvas.getByText("#React")).toBeInTheDocument();
      await expect(canvas.getByText("#TypeScript")).toBeInTheDocument();
    });

    await step("削除ボタンをクリックしてタグを削除", async () => {
      const deleteButtons = canvas.getAllByLabelText(/を削除$/);
      await userEvent.click(deleteButtons[0]);
      await expect(canvas.queryByText("#React")).not.toBeInTheDocument();
      await expect(canvas.getByText("#TypeScript")).toBeInTheDocument();
    });

    await step("Backspaceキーで最後のタグを削除", async () => {
      await userEvent.click(input);
      await userEvent.keyboard("{Backspace}");
      await expect(canvas.queryByText("#TypeScript")).not.toBeInTheDocument();
    });
  },
};

export const SuggestFunctionality: Story = {
  name: "サジェスト機能の動作確認",
  render: (args) => (
    <div>
      <TagInputTestComponent {...args} initialTags={["React"]} />
      <button type="button">Other Button</button>
    </div>
  ),
  args: {
    suggestTags: ["React", "Vue", "Angular", "TypeScript"],
    placeholder: "サジェスト機能テスト",
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");

    await step("既に選択されているタグはサジェストに表示されない", async () => {
      await userEvent.type(input, "R");
      await expect(canvas.queryByText("React")).not.toBeInTheDocument();
    });

    await step("サジェストをクリックしてタグを追加できる", async () => {
      await userEvent.click(canvas.getByText("Vue"));
      await expect(canvas.getByText("#Vue")).toBeInTheDocument();
    });

    await step("フォーカスが外れるとサジェストが閉じる", async () => {
      await userEvent.clear(input);
      await userEvent.type(input, "T");
      await expect(canvas.getByText("TypeScript")).toBeInTheDocument();

      const otherButton = canvas.getByText("Other Button");
      await userEvent.click(otherButton);
    });

    await step("サジェストが閉じたことを確認", async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      await expect(canvas.queryByText("TypeScript")).not.toBeInTheDocument();
    });
  },
};

export const KeyboardNavigation: Story = {
  name: "キーボードナビゲーションでサジェストを操作できる",
  render: (args) => <TagInputTestComponent {...args} />,
  args: {
    suggestTags: ["Item1", "Item2", "Item3"],
    placeholder: "キーボードナビゲーションテスト",
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");

    await step("サジェストが表示されるが、初期状態では何もハイライトされない", async () => {
      await userEvent.type(input, "I");
      await expect(canvas.getByText("Item1")).toHaveAttribute("data-highlighted", "false");
      await expect(canvas.getByText("Item2")).toHaveAttribute("data-highlighted", "false");
      await expect(canvas.getByText("Item3")).toHaveAttribute("data-highlighted", "false");
    });

    await step("ArrowDownで最初の項目がハイライトされる", async () => {
      await userEvent.keyboard("{ArrowDown}");
      await expect(canvas.getByText("Item1")).toHaveAttribute("data-highlighted", "true");
    });

    await step("ArrowDownで次の項目（Item2）に移動できる", async () => {
      await userEvent.keyboard("{ArrowDown}");
      await expect(canvas.getByText("Item2")).toHaveAttribute("data-highlighted", "true");
    });

    await step("ArrowDownで最後の項目（Item3）に移動できる", async () => {
      await userEvent.keyboard("{ArrowDown}");
      await expect(canvas.getByText("Item3")).toHaveAttribute("data-highlighted", "true");
    });

    await step("ArrowDownで最後から選択なし状態に戻る", async () => {
      await userEvent.keyboard("{ArrowDown}");
      await expect(canvas.getByText("Item1")).toHaveAttribute("data-highlighted", "false");
      await expect(canvas.getByText("Item2")).toHaveAttribute("data-highlighted", "false");
      await expect(canvas.getByText("Item3")).toHaveAttribute("data-highlighted", "false");
    });

    await step("ArrowUpで選択なしから最後の項目（Item3）に移動できる", async () => {
      await userEvent.keyboard("{ArrowUp}");
      await expect(canvas.getByText("Item3")).toHaveAttribute("data-highlighted", "true");
    });

    await step("Enterでハイライト中の項目を選択できる", async () => {
      await userEvent.keyboard("{Enter}");
      await expect(canvas.getByText("#Item3")).toBeInTheDocument();
    });
  },
};
