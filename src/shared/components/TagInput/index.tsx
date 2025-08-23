"use client";

import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import Tag from "./Tag";

export type TagInputProps = {
  /** タグの候補リスト */
  suggestTags?: string[];
  /** 入力されているタグのリスト */
  tags?: string[];
  /** タグが変更された */
  onChange?: (value: string[]) => void;
  /** プレースホルダー */
  placeholder?: string;

  className?: string;
  id?: string;
};

export default function TagInput({ suggestTags = [], tags = [], onChange, placeholder, className, id }: TagInputProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [dropdownPosition, setDropdownPosition] = useState<"bottom" | "top">("top");

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isComposingRef = useRef(false);

  const filteredSuggestTags = [...new Set(suggestTags).difference(new Set(tags))];

  const addTag = (newTag: string | undefined) => {
    if (!newTag) {
      return;
    }

    // 重複があれば追加しない
    if (tags.includes(newTag)) {
      return;
    }

    const newTags = [...tags, newTag];

    setInputValue("");
    setOpen(false);

    onChange?.(newTags);
    inputRef.current?.focus();
  };

  const removeTag = (targetTag: string | undefined) => {
    if (!targetTag) {
      return;
    }

    const newValue = tags.filter((tag) => tag !== targetTag);

    onChange?.(newValue);
    inputRef.current?.focus();
  };

  const updateHighlightedIndex = (newIndex: number) => {
    setHighlightedIndex(newIndex);

    // ハイライトされた要素が見えるようにスクロール
    if (newIndex >= 0) {
      const highlightedElement = document.getElementById(`option-${newIndex}`);

      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  };

  const handleInputMount = (ref: HTMLInputElement | null) => {
    if (!ref) {
      return;
    }

    // IMEの入力状態を見るためのイベントリスナーを登録
    ref.addEventListener("compositionstart", () => {
      isComposingRef.current = true;
    });

    ref.addEventListener("compositionend", () => {
      isComposingRef.current = false;
    });

    inputRef.current = ref;
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // 補完ウィンドウが閉じていて、かつ入力中なら補完ウィンドウを開く
    if (!open && inputValue) {
      setOpen(true);
      setHighlightedIndex(0);
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        updateHighlightedIndex(highlightedIndex < filteredSuggestTags.length - 1 ? highlightedIndex + 1 : 0);
        break;

      case "ArrowUp":
        e.preventDefault();
        updateHighlightedIndex(highlightedIndex > 0 ? highlightedIndex - 1 : filteredSuggestTags.length - 1);
        break;

      case "Tab":
      case "Enter":
        if (inputValue.trim() === "") {
          break;
        }

        e.preventDefault();

        // IMEが入力中なら処理しない
        if (isComposingRef.current) {
          break;
        }

        // 候補選択中ならそのタグを追加
        if (highlightedIndex >= 0 && filteredSuggestTags.at(highlightedIndex)) {
          addTag(filteredSuggestTags.at(highlightedIndex));
          break;
        }

        // 入力中ならそのままタグを追加
        addTag(inputValue.trim());

        break;

      case "Escape":
        if (open) {
          e.preventDefault();
          setOpen(false);
        }
        break;

      case " ":
        // IMEが入力中なら処理しない
        if (isComposingRef.current) {
          break;
        }

        e.preventDefault();

        // 空白だけなら入力させない
        if (inputValue.trim() === "") {
          break;
        }

        addTag(inputValue.trim());
        break;

      case "Backspace":
        if (inputValue === "" && tags.length > 0) {
          removeTag(tags.at(-1));
        }
        break;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    setInputValue(newValue);

    const openState = newValue.trim() !== "";
    setOpen(openState);

    if (openState) {
      setHighlightedIndex(0);
    }
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const relatedTarget = e.relatedTarget as HTMLElement;

    // 補完候補の要素にフォーカスが移動した場合は閉じない
    if (relatedTarget?.closest('[data-dropdown="true"]')) {
      return;
    }

    setOpen(false);
  };

  // ドロップダウンの位置を計算する
  useEffect(() => {
    if (!open || !inputRef.current) {
      return;
    }

    const updateDropdownPosition = () => {
      if (!inputRef.current) {
        return;
      }

      const inputRect = inputRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const dropdownMaxHeight = 240; // max-h-60 (240px)
      const spaceBelow = viewportHeight - inputRect.bottom;
      const spaceAbove = inputRect.top;

      // 下に十分なスペースがあるか、上よりも下のスペースが大きい場合は下に表示
      if (spaceBelow >= dropdownMaxHeight || spaceBelow >= spaceAbove) {
        setDropdownPosition("bottom");
      } else {
        setDropdownPosition("top");
      }
    };

    updateDropdownPosition();

    // ウィンドウサイズ変更時に再計算
    window.addEventListener("resize", updateDropdownPosition);
    window.addEventListener("scroll", updateDropdownPosition, true);

    return () => {
      window.removeEventListener("resize", updateDropdownPosition);
      window.removeEventListener("scroll", updateDropdownPosition, true);
    };
  }, [open]);

  return (
    <div className={twMerge("w-full", className)}>
      <label htmlFor={id} className="mb-2 block font-medium text-sm text-warm-black">
        タグ
      </label>
      <div className="relative">
        <div className="flex w-full flex-wrap items-center gap-1 rounded-lg border border-warm-black-50 bg-warm-white px-3 py-2 transition-colors duration-400 ease-magnetic focus-within:border-warm-black">
          {tags.map((tag, index) => (
            <Tag key={`${tag}-${index.toString()}`} tagName={tag} onClickRemove={() => removeTag(tag)} />
          ))}

          <input
            id={id}
            ref={handleInputMount}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onBlur={handleInputBlur}
            placeholder={tags.length === 0 ? placeholder : ""}
            className="min-w-[120px] flex-1 bg-transparent text-warm-black outline-none placeholder:text-warm-black-50"
            autoComplete="off"
          />
        </div>

        {open && filteredSuggestTags.length > 0 && (
          <div
            ref={dropdownRef}
            className={twMerge(
              "absolute right-0 left-0 z-50 max-h-60 overflow-y-auto rounded-lg border border-warm-black-25 bg-warm-white shadow-lg",
              dropdownPosition === "bottom" ? "top-full mt-1" : "bottom-full mb-1",
            )}
            data-dropdown="true"
          >
            {filteredSuggestTags.map((suggestTag, index) => (
              <button
                key={suggestTag}
                id={`option-${index}`}
                type="button"
                onClick={() => addTag(suggestTag)}
                className={twMerge(
                  "relative flex w-full cursor-pointer items-center px-3 py-2 text-sm outline-none transition-colors duration-400 ease-magnetic",
                  index === highlightedIndex
                    ? "bg-warm-black text-warm-white"
                    : "text-warm-black hover:bg-warm-black-25",
                )}
              >
                {suggestTag}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
