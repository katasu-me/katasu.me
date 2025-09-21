import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TagInput from "./index";

describe("TagInput", () => {
  const mockOnChange = vi.fn();
  const suggestTags = ["React", "TypeScript", "JavaScript"];

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it("タグを追加できる", async () => {
    const user = userEvent.setup();

    render(<TagInput suggestTags={suggestTags} tags={[]} onChangeTags={mockOnChange} placeholder="タグを入力" />);

    const input = screen.getByPlaceholderText("タグを入力");

    // 新しいタグを入力してEnter
    await user.type(input, "NewTag");
    await user.keyboard("{Enter}");

    expect(mockOnChange).toHaveBeenCalledWith(["NewTag"]);
  });

  it("サジェストから選択できる", async () => {
    const user = userEvent.setup();

    render(<TagInput suggestTags={suggestTags} tags={[]} onChangeTags={mockOnChange} />);

    // Rを入力してReactを表示
    const input = screen.getByRole("textbox");
    await user.type(input, "R");

    expect(screen.getByText("React")).toBeInTheDocument();

    // ArrowDownで選択してEnter
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Enter}");

    expect(mockOnChange).toHaveBeenCalledWith(["React"]);
  });

  it("タグを削除できる", async () => {
    const user = userEvent.setup();

    render(<TagInput suggestTags={suggestTags} tags={["React", "TypeScript"]} onChangeTags={mockOnChange} />);

    // 削除ボタンをクリック
    const deleteButton = screen.getByLabelText("Reactを削除");
    await user.click(deleteButton);

    expect(mockOnChange).toHaveBeenCalledWith(["TypeScript"]);
  });

  it("重複したタグは追加されない", async () => {
    const user = userEvent.setup();

    render(<TagInput suggestTags={suggestTags} tags={["React"]} onChangeTags={mockOnChange} />);

    // 既存のタグを入力
    const input = screen.getByRole("textbox");
    await user.type(input, "React");
    await user.keyboard("{Enter}");

    // onChangeが呼ばれないことを確認
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it("空白文字列は追加されない", async () => {
    const user = userEvent.setup();

    render(<TagInput suggestTags={suggestTags} tags={[]} onChangeTags={mockOnChange} />);

    // 空白のみ入力してEnter
    const input = screen.getByRole("textbox");
    await user.type(input, "   ");
    await user.keyboard("{Enter}");

    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it("Backspaceで最後のタグを削除できる", async () => {
    const user = userEvent.setup();

    render(<TagInput suggestTags={suggestTags} tags={["React", "TypeScript"]} onChangeTags={mockOnChange} />);

    const input = screen.getByRole("textbox");
    await user.click(input);

    // 入力が空の状態でBackspace
    await user.keyboard("{Backspace}");

    expect(mockOnChange).toHaveBeenCalledWith(["React"]);
  });
});
