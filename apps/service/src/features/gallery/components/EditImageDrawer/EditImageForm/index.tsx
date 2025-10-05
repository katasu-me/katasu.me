import { getFormProps, getInputProps, type SubmissionResult, useForm, useInputControl } from "@conform-to/react";
import { parseWithValibot } from "@conform-to/valibot";
import { useActionState, useEffect } from "react";
import { editImageAction } from "@/features/gallery/actions/edit";
import { editImageSchema } from "@/features/gallery/schemas/edit";
import FormContent from "./FormContent";

type Props = {
  imageId: string;
  imageSrc: string;
  imageWidth: number;
  imageHeight: number;
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

export default function EditImageForm({
  imageId,
  imageSrc,
  imageWidth,
  imageHeight,
  defaultTitle = "",
  defaultTags = [],
  onSuccess,
}: Props) {
  const [lastResult, action] = useActionState(editImageAction, undefined);

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

  // React 19で送信後にフォームがリセットされる問題のワークアラウンド
  // @see https://github.com/edmundhung/conform/issues/681
  useEffect(() => {
    const preventDefault = (event: Event) => {
      if (event.target === document.forms.namedItem(form.id)) {
        event.preventDefault();
      }
    };

    document.addEventListener("reset", preventDefault, true);

    return () => {
      document.removeEventListener("reset", preventDefault, true);
    };
  }, [form.id]);

  // 更新成功時にコールバック発火
  useEffect(() => {
    if (lastResult?.status === "success") {
      onSuccess?.();
    }
  }, [lastResult, onSuccess]);

  const handleTagChange = (tags: string[]) => {
    tagInput.change(tags);
  };

  const isFormValid = Object.values(form.allErrors).length === 0;

  return (
    <form {...getFormProps(form)} action={action} noValidate>
      <input {...getInputProps(fields.imageId, { type: "hidden" })} />
      <FormContent
        imageSrc={imageSrc}
        imageWidth={imageWidth}
        imageHeight={imageHeight}
        form={form}
        fields={fields}
        tagInput={tagInput}
        handleTagChange={handleTagChange}
        isFormValid={isFormValid}
      />
    </form>
  );
}
