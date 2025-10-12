import { getFormProps, getInputProps, type SubmissionResult, useForm, useInputControl } from "@conform-to/react";
import { parseWithValibot } from "@conform-to/valibot";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import FormErrorMessage from "@/components/FormErrorMessage";
import { editImageAction } from "@/features/gallery/actions/edit";
import { usePreventFormReset } from "@/features/gallery/hooks/usePreventFormReset";
import { editImageSchema, MAX_TAG_COUNT, MAX_TAG_TEXT_LENGTH, MAX_TITLE_LENGTH } from "@/features/gallery/schemas/edit";
import FormInputFields from "../../FormInputFields";
import FormSubmitButton from "../../FormSubmitButton";

type Props = {
  imageId: string;
  defaultTitle?: string;
  defaultTags?: string[];
  onSuccess?: () => void;
};

const defaultResult: SubmissionResult<string[]> = {
  status: "error",
  error: {
    imageId: [""],
  },
};

export default function EditForm({ imageId, defaultTitle = "", defaultTags = [], onSuccess }: Props) {
  const [lastResult, action] = useActionState(editImageAction, undefined);
  const { pending } = useFormStatus();

  const [form, fields] = useForm({
    lastResult: lastResult || defaultResult,
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    onValidate({ formData }) {
      return parseWithValibot(formData, {
        schema: editImageSchema,
      });
    },
    defaultValue: {
      imageId,
      title: defaultTitle,
      tags: defaultTags,
    },
  });

  const tagInput = useInputControl(fields.tags);
  const isFormValid = Object.values(form.allErrors).length === 0;

  // React 19で送信後にフォームがリセットされる問題のワークアラウンド
  usePreventFormReset(form.id);

  // 更新成功時にコールバック発火
  useEffect(() => {
    if (lastResult?.status === "success") {
      onSuccess?.();
    }
  }, [lastResult, onSuccess]);

  const handleTagChange = (tags: string[]) => {
    tagInput.change(tags);
    form.validate();
  };

  return (
    <form {...getFormProps(form)} action={action} noValidate>
      <input {...getInputProps(fields.imageId, { type: "hidden" })} />

      {/* フォーム全体のエラー */}
      {form.errors && form.errors.length > 0 && <FormErrorMessage text={form.errors[0]} />}
      {fields.imageId.errors?.at(0) && <FormErrorMessage text={fields.imageId.errors[0]} />}

      <FormInputFields
        fields={{ title: fields.title, tags: fields.tags }}
        tagInput={tagInput}
        handleTagChange={handleTagChange}
        titlePlaceholder="タイトルを入力"
        tagPlaceholder="タグを追加"
        maxTitleLength={MAX_TITLE_LENGTH}
        maxTagCount={MAX_TAG_COUNT}
        maxTagTextLength={MAX_TAG_TEXT_LENGTH}
        disabled={pending}
      />

      <FormSubmitButton disabled={!isFormValid} label="変更" pendingLabel="変更中…" />
    </form>
  );
}
