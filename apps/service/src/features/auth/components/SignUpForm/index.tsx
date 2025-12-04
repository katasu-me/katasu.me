import { useForm } from "@tanstack/react-form";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import AvatarUpload from "@/components/AvatarUpload";
import FormMessage from "@/components/FormMessage";
import FormSubmitButton from "@/components/FormSubmitButton";
import Input from "@/components/Input";
import { DOCS_PRIVACY_POLICY, DOCS_TERMS_OF_SERVICE } from "@/constants/site";
import { type SignUpFormInput, signUpFormSchema } from "@/features/auth/schemas/signup";
import { signupAction } from "@/features/auth/server-fn/signup";
import { MAX_USERNAME_LENGTH } from "@/schemas/user";

type Props = {
  className?: string;
};

export default function SignUpForm({ className }: Props) {
  const signupFn = useServerFn(signupAction);
  const [formError, setFormError] = useState<string>("");

  const defaultValues: SignUpFormInput = {
    username: "",
    agreeToTerms: false,
    agreeToPrivacy: false,
  };

  const form = useForm({
    defaultValues,
    validators: {
      onMount: signUpFormSchema,
      onChange: signUpFormSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError("");

      try {
        const formData = new FormData();
        formData.append("username", value.username);

        if (value.avatar) {
          formData.append("avatar", value.avatar);
        }

        if (value.agreeToTerms) {
          formData.append("agreeToTerms", "on");
        }

        if (value.agreeToPrivacy) {
          formData.append("agreeToPrivacy", "on");
        }

        const result = await signupFn({ data: formData });

        if (!result.success) {
          setFormError("新規登録に失敗しました");
        }
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
      {formError && <FormMessage type="error" className="mb-16" text={formError} />}

      <div className="flex pc:w-sm w-full flex-col gap-6">
        <form.Field name="avatar">
          {(field) => (
            <>
              <AvatarUpload
                name={field.name}
                onFileChange={(file) => {
                  field.handleChange(file ?? undefined);
                }}
                error={
                  field.state.meta.errors.length > 0 && !field.state.meta.errorMap.onMount
                    ? typeof field.state.meta.errors[0] === "string"
                      ? field.state.meta.errors[0]
                      : field.state.meta.errors[0]?.message
                    : undefined
                }
              />
            </>
          )}
        </form.Field>

        <form.Field name="username">
          {(field) => (
            <Input
              name={field.name}
              type="text"
              value={field.state.value}
              onChange={(e) => {
                field.handleChange(e.target.value);
              }}
              onBlur={field.handleBlur}
              label="ユーザー名"
              placeholder="すてきな名前"
              error={
                field.state.meta.errors.length > 0 && !field.state.meta.errorMap.onMount
                  ? typeof field.state.meta.errors[0] === "string"
                    ? field.state.meta.errors[0]
                    : field.state.meta.errors[0]?.message
                  : undefined
              }
              maxLength={MAX_USERNAME_LENGTH}
              currentLength={field.state.value?.length ?? 0}
              autoComplete="off"
            />
          )}
        </form.Field>

        <div className="space-y-3">
          <form.Field name="agreeToTerms">
            {(field) => (
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={field.state.value}
                  onChange={(e) => {
                    field.handleChange(e.target.checked);
                  }}
                  className="size-4 cursor-pointer accent-warm-black"
                  required={true}
                />
                <span className="text-sm text-warm-black">
                  <a
                    className="mr-1 font-bold hover:underline"
                    href={DOCS_TERMS_OF_SERVICE}
                    target="_blank"
                    rel="noopener"
                  >
                    利用規約
                  </a>
                  に同意します
                </span>
              </label>
            )}
          </form.Field>

          <form.Field name="agreeToPrivacy">
            {(field) => (
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={field.state.value}
                  onChange={(e) => {
                    field.handleChange(e.target.checked);
                  }}
                  className="size-4 cursor-pointer accent-warm-black"
                  required={true}
                />
                <span className="text-sm text-warm-black">
                  <a
                    className="mr-1 font-bold hover:underline"
                    href={DOCS_PRIVACY_POLICY}
                    target="_blank"
                    rel="noopener"
                  >
                    プライバシーポリシー
                  </a>
                  に同意します
                </span>
              </label>
            )}
          </form.Field>
        </div>

        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <FormSubmitButton
              className="w-full"
              disabled={!canSubmit || isSubmitting}
              isSubmitting={isSubmitting}
              label="新規登録する"
              pendingLabel="登録中…"
            />
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
