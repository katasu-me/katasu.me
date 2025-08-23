import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TagInput } from ".";

describe("TagInput", () => {
  const mockOnChange = vi.fn();
  const defaultSuggestTags = ["React", "Vue", "Angular", "TypeScript"];

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it("初期表示時にプレースホルダーが表示される", () => {
    render(<TagInput placeholder="タグを入力してください" />);
    expect(screen.getByPlaceholderText("タグを入力してください")).toBeInTheDocument();
  });

  it("タグが存在する場合はプレースホルダーが表示されない", () => {
    render(<TagInput tags={["React"]} placeholder="タグを入力してください" />);
    expect(screen.queryByPlaceholderText("タグを入力してください")).not.toBeInTheDocument();
  });

  it("既存のタグが表示される", () => {
    const tags = ["React", "TypeScript"];
    render(<TagInput tags={tags} />);

    tags.forEach((tag) => {
      expect(screen.getByText(tag)).toBeInTheDocument();
    });
  });

  it("Enterキーでタグを追加できる", async () => {
    const user = userEvent.setup();
    render(<TagInput onChange={mockOnChange} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "NewTag");
    await user.keyboard("{Enter}");

    expect(mockOnChange).toHaveBeenCalledWith(["NewTag"]);
  });

  it("スペースキーでタグを追加できる", async () => {
    const user = userEvent.setup();
    render(<TagInput onChange={mockOnChange} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "NewTag ");

    expect(mockOnChange).toHaveBeenCalledWith(["NewTag"]);
  });

  it("空白のみの入力ではタグが追加されない", async () => {
    const user = userEvent.setup();
    render(<TagInput onChange={mockOnChange} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "   ");
    await user.keyboard("{Enter}");

    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it("重複するタグは追加されない", async () => {
    const user = userEvent.setup();
    render(<TagInput tags={["React"]} onChange={mockOnChange} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "React");
    await user.keyboard("{Enter}");

    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it("タグの削除ボタンをクリックするとタグが削除される", async () => {
    const user = userEvent.setup();
    render(<TagInput tags={["React", "TypeScript"]} onChange={mockOnChange} />);

    const deleteButtons = screen.getAllByLabelText(/を削除$/);
    await user.click(deleteButtons[0]);

    expect(mockOnChange).toHaveBeenCalledWith(["TypeScript"]);
  });

  it("Backspaceキーで最後のタグを削除できる", async () => {
    const user = userEvent.setup();
    render(<TagInput tags={["React", "TypeScript"]} onChange={mockOnChange} />);

    const input = screen.getByRole("textbox");
    await user.click(input);
    await user.keyboard("{Backspace}");

    expect(mockOnChange).toHaveBeenCalledWith(["React"]);
  });

  describe("サジェスト機能", () => {
    it("入力時にサジェストリストが表示される", async () => {
      const user = userEvent.setup();
      render(<TagInput suggestTags={defaultSuggestTags} />);

      const input = screen.getByRole("textbox");
      await user.type(input, "R");

      expect(screen.getByText("React")).toBeInTheDocument();
      expect(screen.getByText("Vue")).toBeInTheDocument();
    });

    it("既に選択されているタグはサジェストに表示されない", async () => {
      const user = userEvent.setup();
      render(<TagInput tags={["React"]} suggestTags={defaultSuggestTags} />);

      const input = screen.getByRole("textbox");
      await user.type(input, "R");

      // サジェストリスト内のボタンを探す
      const suggestButtons = screen.getAllByRole("button").filter(
        (btn) => !btn.hasAttribute("aria-label"), // 削除ボタンではないもの
      );

      // Reactはサジェストリストにないことを確認
      expect(suggestButtons.map((btn) => btn.textContent)).not.toContain("React");
      // 他のタグはサジェストリストにあることを確認
      expect(screen.getByText("Vue")).toBeInTheDocument();
      expect(screen.getByText("Angular")).toBeInTheDocument();
      expect(screen.getByText("TypeScript")).toBeInTheDocument();
    });

    it("ArrowDownキーでサジェストを下に移動できる", async () => {
      const user = userEvent.setup();
      render(<TagInput suggestTags={defaultSuggestTags} />);

      const input = screen.getByRole("textbox");
      await user.type(input, "T");
      await user.keyboard("{ArrowDown}");

      const options = screen.getAllByRole("button");
      expect(options[1]).toHaveClass("bg-gray-100");
    });

    it("ArrowUpキーでサジェストを上に移動できる", async () => {
      const user = userEvent.setup();
      render(<TagInput suggestTags={defaultSuggestTags} />);

      const input = screen.getByRole("textbox");
      await user.type(input, "T");
      await user.keyboard("{ArrowDown}");
      await user.keyboard("{ArrowUp}");

      const options = screen.getAllByRole("button");
      expect(options[0]).toHaveClass("bg-gray-100");
    });

    it("Enterキーで選択中のサジェストを追加できる", async () => {
      const user = userEvent.setup();
      render(<TagInput suggestTags={defaultSuggestTags} onChange={mockOnChange} />);

      const input = screen.getByRole("textbox");
      await user.type(input, "T");
      await user.keyboard("{ArrowDown}");
      await user.keyboard("{Enter}");

      expect(mockOnChange).toHaveBeenCalledWith(["Vue"]);
    });

    it("サジェストをクリックして選択できる", async () => {
      const user = userEvent.setup();
      render(<TagInput suggestTags={defaultSuggestTags} onChange={mockOnChange} />);

      const input = screen.getByRole("textbox");
      await user.type(input, "T");

      const vueOption = screen.getByText("Vue");
      await user.click(vueOption);

      expect(mockOnChange).toHaveBeenCalledWith(["Vue"]);
    });

    it("Escapeキーでサジェストが閉じる", async () => {
      const user = userEvent.setup();
      render(<TagInput suggestTags={defaultSuggestTags} />);

      const input = screen.getByRole("textbox");
      await user.type(input, "T");

      expect(screen.getByText("React")).toBeInTheDocument();

      await user.keyboard("{Escape}");

      expect(screen.queryByText("React")).not.toBeInTheDocument();
    });

    it("inputからフォーカスが外れるとサジェストが閉じる", async () => {
      const user = userEvent.setup();
      render(
        <div>
          <TagInput suggestTags={defaultSuggestTags} />
          <button>Other Button</button>
        </div>,
      );

      const input = screen.getByRole("textbox");
      await user.type(input, "T");

      expect(screen.getByText("React")).toBeInTheDocument();

      const otherButton = screen.getByText("Other Button");
      await user.click(otherButton);

      await waitFor(() => {
        expect(screen.queryByText("React")).not.toBeInTheDocument();
      });
    });

    it("サジェストをクリックした場合はドロップダウンが閉じない", async () => {
      const user = userEvent.setup();
      render(<TagInput suggestTags={defaultSuggestTags} onChange={mockOnChange} />);

      const input = screen.getByRole("textbox");
      await user.type(input, "T");

      const dropdown = screen.getByRole("button", { name: "React" }).parentElement;
      expect(dropdown).toHaveAttribute("data-dropdown", "true");

      const reactOption = screen.getByText("React");
      await user.click(reactOption);

      expect(mockOnChange).toHaveBeenCalledWith(["React"]);
    });
  });

  describe("キーボードナビゲーション", () => {
    it("ArrowDownキーで最後の項目から最初の項目に戻る", async () => {
      const user = userEvent.setup();
      const tags = ["Item1", "Item2"];
      render(<TagInput suggestTags={tags} />);

      const input = screen.getByRole("textbox");
      await user.type(input, "I");

      // 最初の項目 (index 0)
      expect(screen.getByText("Item1")).toHaveClass("bg-gray-100");

      await user.keyboard("{ArrowDown}");
      // 2番目の項目 (index 1)
      expect(screen.getByText("Item2")).toHaveClass("bg-gray-100");

      await user.keyboard("{ArrowDown}");
      // 最初の項目に戻る (index 0)
      expect(screen.getByText("Item1")).toHaveClass("bg-gray-100");
    });

    it("ArrowUpキーで最初の項目から最後の項目に移動する", async () => {
      const user = userEvent.setup();
      const tags = ["Item1", "Item2"];
      render(<TagInput suggestTags={tags} />);

      const input = screen.getByRole("textbox");
      await user.type(input, "I");
      await user.keyboard("{ArrowUp}");

      const options = screen.getAllByRole("button");
      expect(options[options.length - 1]).toHaveClass("bg-gray-100");
    });
  });

  it("className propが適用される", () => {
    const { container } = render(<TagInput className="custom-class" />);
    expect(container.firstChild).toHaveClass("custom-class", "w-full");
  });
});
