import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import FormMessage from "@/components/FormMessage";
import FormSubmitButton from "@/components/FormSubmitButton";
import Input from "@/components/Input";
import TagInput from "@/components/TagInput";
import type { EditImageData } from "../../schemas/edit";
import { editImageSchema, MAX_TAG_COUNT, MAX_TAG_TEXT_LENGTH, MAX_TITLE_LENGTH } from "../../schemas/edit";
import { editImageFn } from "../../server-fn/edit-image";

type Props = {
  imageId: string;
  defaultTitle?: string;
  defaultTags?: string[];
  onSuccess?: () => void;
};

export default function EditForm({ imageId, defaultTitle = "", defaultTags = [], onSuccess }: Props) {
  const [formError, setFormError] = useState<string>("");

  const defaultValues: EditImageData = {
    imageId,
    title: defaultTitle,
    tags: defaultTags,
  };

  const form = useForm({
    defaultValues,
    validators: {
      onChange: editImageSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError("");

      try {
        const result = await editImageFn({
          data: {
            imageId: value.imageId,
            title: value.title,
            tags: value.tags ? JSON.stringify(value.tags) : undefined,
          },
        });

        if (result.success) {
          onSuccess?.();
        } else {
          setFormError(result.error);
        }
      } catch (error) {
        setFormError(error instanceof Error ? error.message : "画像情報の更新に失敗しました");
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      noValidate
    >
      {formError && <FormMessage type="error" className="mb-4" text={formError} />}

      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
        {([canSubmit, isSubmitting]) => (
          <>
            <div className="flex flex-col gap-4">
              <form.Field name="title">
                {(field) => (
                  <Input
                    name={field.name}
                    type="text"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    label={
                      <>
                        タイトル
                        <span className="text-warm-black text-xs">(なくてもいいよ)</span>
                      </>
                    }
                    placeholder="タイトルを入力"
                    error={
                      typeof field.state.meta.errors[0] === "string"
                        ? field.state.meta.errors[0]
                        : field.state.meta.errors[0]?.message
                    }
                    maxLength={MAX_TITLE_LENGTH}
                    currentLength={field.state.value?.length}
                    autoComplete="off"
                    disabled={isSubmitting}
                  />
                )}
              </form.Field>

              <form.Field name="tags">
                {(field) => (
                  <TagInput
                    maxTags={MAX_TAG_COUNT}
                    maxTagTextLength={MAX_TAG_TEXT_LENGTH}
                    tags={field.state.value ?? []}
                    onChangeTags={field.handleChange}
                    placeholder="タグを追加"
                    suggestTags={[]}
                    disabled={isSubmitting}
                    error={
                      typeof field.state.meta.errors[0] === "string"
                        ? field.state.meta.errors[0]
                        : field.state.meta.errors[0]?.message
                    }
                  />
                )}
              </form.Field>
            </div>

            <FormSubmitButton
              className="mt-6 w-full"
              disabled={!canSubmit || isSubmitting}
              isSubmitting={isSubmitting}
              label="変更"
              pendingLabel="変更中…"
            />
          </>
        )}
      </form.Subscribe>
    </form>
  );
}
