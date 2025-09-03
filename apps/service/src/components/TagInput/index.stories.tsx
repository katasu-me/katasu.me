import type { Meta, StoryObj } from "@storybook/react";
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
