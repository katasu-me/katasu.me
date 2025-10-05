import { getInputProps, type useForm, type useInputControl } from "@conform-to/react";
import { useFormStatus } from "react-dom";
import type { InferOutput } from "valibot";
import IconExclamationCircle from "@/assets/icons/exclamation-circle.svg";
import Input from "@/components/Input";
import TagInput from "@/components/TagInput";
import {
  type editImageSchema,
  MAX_TAG_COUNT,
  MAX_TAG_TEXT_LENGTH,
  MAX_TITLE_LENGTH,
} from "@/features/gallery/schemas/edit";
import SubmitButton from "./SubmitButton";

type Props = {
  form: ReturnType<typeof useForm<InferOutput<typeof editImageSchema>>>[0];
  fields: ReturnType<typeof useForm<InferOutput<typeof editImageSchema>>>[1];
  tagInput: ReturnType<typeof useInputControl>;
  handleTagChange: (tags: string[]) => void;
  isFormValid: boolean;
};

export default function EditFormContent({ form, fields, tagInput, handleTagChange, isFormValid }: Props) {
  const { pending } = useFormStatus();

  return (
    <>
      {/* フォーム全体のエラー */}
      {form.errors && form.errors.length > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-600 bg-red-50 p-4">
          <IconExclamationCircle className="size-6 text-red-600" />
          <p className="text-red-600 text-sm">{form.errors[0]}</p>
        </div>
      )}

      {/* タイトル */}
      <Input
        {...getInputProps(fields.title, { type: "text" })}
        label={
          <>
            タイトル
            <span className="text-warm-black text-xs">(なくてもいいよ)</span>
          </>
        }
        placeholder="タイトルを入力"
        error={fields.title.errors?.at(0)}
        maxLength={MAX_TITLE_LENGTH}
        currentLength={fields.title.value?.length ?? 0}
        autoComplete="off"
        disabled={pending}
      />

      {/* タグ */}
      <TagInput
        id={fields.tags.id}
        maxTags={MAX_TAG_COUNT}
        maxTagTextLength={MAX_TAG_TEXT_LENGTH}
        suggestTags={[]} // TODO: 後でサジェスト機能を実装する
        tags={(tagInput.value as string[]) || []}
        onChangeTags={handleTagChange}
        placeholder="タグを追加"
        error={fields.tags.errors?.at(0)}
        disabled={pending}
      />

      <SubmitButton disabled={!isFormValid} />
    </>
  );
}
