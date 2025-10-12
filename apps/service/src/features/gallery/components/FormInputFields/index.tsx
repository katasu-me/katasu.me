import { type FieldMetadata, getInputProps, type useInputControl } from "@conform-to/react";
import Input from "@/components/Input";
import TagInput from "@/components/TagInput";

type Props = {
  fields: {
    title: FieldMetadata<string | undefined>;
    tags: FieldMetadata<string[] | undefined>;
  };
  tagInput: ReturnType<typeof useInputControl>;
  handleTagChange: (tags: string[]) => void;
  titlePlaceholder?: string;
  tagPlaceholder?: string;
  maxTitleLength: number;
  maxTagCount: number;
  maxTagTextLength: number;
  disabled?: boolean;
};

/**
 * タイトルとタグの入力フィールドを提供する共通コンポーネント
 */
export default function FormInputFields({
  fields,
  tagInput,
  handleTagChange,
  titlePlaceholder = "タイトルを入力",
  tagPlaceholder = "タグを追加",
  maxTitleLength,
  maxTagCount,
  maxTagTextLength,
  disabled = false,
}: Props) {
  return (
    <>
      {/* タイトル */}
      <Input
        {...getInputProps(fields.title, { type: "text" })}
        label={
          <>
            タイトル
            <span className="text-warm-black text-xs">(なくてもいいよ)</span>
          </>
        }
        placeholder={titlePlaceholder}
        error={fields.title.errors?.at(0)}
        maxLength={maxTitleLength}
        currentLength={fields.title.value?.length ?? 0}
        autoComplete="off"
        disabled={disabled}
      />

      {/* タグ */}
      <TagInput
        id={fields.tags.id}
        maxTags={maxTagCount}
        maxTagTextLength={maxTagTextLength}
        suggestTags={[]} // TODO: 後でサジェスト機能を実装する
        tags={(tagInput.value as string[]) || []}
        onChangeTags={handleTagChange}
        placeholder={tagPlaceholder}
        error={fields.tags.errors?.at(0)}
        disabled={disabled}
      />
    </>
  );
}
