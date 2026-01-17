import { useForm } from "@tanstack/react-form";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import * as v from "valibot";
import FormMessage from "@/components/FormMessage";
import FormSubmitButton from "@/components/FormSubmitButton";
import Input from "@/components/Input";
import { MAX_CUSTOM_URL_LENGTH, optionalCustomUrlSchema } from "@/schemas/custom-url";
import { updateCustomUrlFn } from "../../server-fn/update-custom-url";

type Props = {
  userId: string;
  currentCustomUrl: string | null;
  className?: string;
};

const formSchema = v.object({
  customUrl: optionalCustomUrlSchema,
});

type FormInput = v.InferInput<typeof formSchema>;

export default function CustomUrlForm({ userId, currentCustomUrl, className }: Props) {
  const router = useRouter();
  const updateCustomUrl = useServerFn(updateCustomUrlFn);
  const [formError, setFormError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const defaultValues: FormInput = {
    customUrl: currentCustomUrl ?? "",
  };

  const form = useForm({
    defaultValues,
    validators: {
      onMount: formSchema,
      onChange: formSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError("");
      setSuccessMessage("");

      try {
        const result = await updateCustomUrl({
          data: {
            customUrl: value.customUrl ?? "",
          },
        });

        if (!result.success) {
          setFormError(result.error);
          return;
        }

        setSuccessMessage("あたらしいマイページのURLを保存しました");
        await router.invalidate({
          sync: true,
        });
      } catch (error) {
        if (error instanceof Error) {
          setFormError(error.message);
        }
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
      className={className}
      noValidate
    >
      {formError && <FormMessage type="error" className="mb-8" text={formError} />}
      {successMessage && <FormMessage type="success" className="mb-8" text={successMessage} />}

      <div className="flex w-full flex-col gap-6">
        <form.Field name="customUrl">
          {(field) => (
            <div className="flex flex-col gap-2">
              <Input
                name={field.name}
                type="text"
                value={field.state.value ?? ""}
                onChange={(e) => {
                  field.handleChange(e.target.value);
                }}
                onBlur={field.handleBlur}
                label="URLをカスタマイズ"
                placeholder={userId}
                error={
                  field.state.meta.errors.length > 0 && !field.state.meta.errorMap.onMount
                    ? field.state.meta.errors.at(0)?.message
                    : undefined
                }
                maxLength={MAX_CUSTOM_URL_LENGTH}
                currentLength={field.state.value?.length ?? 0}
                autoComplete="off"
              />
              <p className="text-xs">
                https://katasu.me/user/ に続く、すきな文字列を入力してください。 空欄にすると削除されます。
              </p>
            </div>
          )}
        </form.Field>

        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <FormSubmitButton
              className="w-full"
              disabled={!canSubmit || isSubmitting}
              isSubmitting={isSubmitting}
              label="保存する"
              pendingLabel="保存中…"
            />
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
