import Input from "@/components/Input";
import TagInput from "@/components/TagInput";

type FieldProps = {
  id?: string;
  name: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  onBlur: () => void;
};

type TagFieldProps = {
  id?: string;
  value: string[];
  error?: string;
  onChange: (tags: string[]) => void;
};

type Props = {
  title: FieldProps;
  tags: TagFieldProps;
  titlePlaceholder?: string;
  tagPlaceholder?: string;
  maxTitleLength: number;
  maxTagCount: number;
  maxTagTextLength: number;
  disabled?: boolean;
};

export default function FormInputFields({
  title,
  tags,
  titlePlaceholder = "タイトルを入力",
  tagPlaceholder = "タグを追加",
  maxTitleLength,
  maxTagCount,
  maxTagTextLength,
  disabled = false,
}: Props) {
  return (
    <>
      <Input
        id={title.id}
        name={title.name}
        type="text"
        value={title.value}
        onChange={(e) => title.onChange(e.target.value)}
        onBlur={title.onBlur}
        label={
          <>
            タイトル
            <span className="text-warm-black text-xs">(なくてもいいよ)</span>
          </>
        }
        placeholder={titlePlaceholder}
        error={title.error}
        maxLength={maxTitleLength}
        currentLength={title.value.length}
        autoComplete="off"
        disabled={disabled}
      />

      <TagInput
        id={tags.id}
        maxTags={maxTagCount}
        maxTagTextLength={maxTagTextLength}
        suggestTags={[]}
        tags={tags.value}
        onChangeTags={tags.onChange}
        placeholder={tagPlaceholder}
        error={tags.error}
        disabled={disabled}
      />
    </>
  );
}
