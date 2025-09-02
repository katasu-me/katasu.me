"use client";

import { useForm } from "@conform-to/react";
import { parseWithValibot } from "@conform-to/valibot";
import { useActionState } from "react";
import Button from "@/shared/components/Button";
import Input from "@/shared/components/Input";
import { signupAction } from "../../actions/signup";
import { MAX_USERNAME_LENGTH, signUpFormSchema } from "../../schemas/signup-form";
import AvatarUpload from "../AvatarUpload";

export default function SignUpForm() {
  const [lastResult, action] = useActionState(signupAction, undefined);

  const [form, fields] = useForm({
    lastResult,
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    onValidate({ formData }) {
      return parseWithValibot(formData, {
        schema: signUpFormSchema,
      });
    },
  });

  const isFormValid =
    fields.username.value?.trim() &&
    fields.agreeToTerms.value === "on" &&
    fields.agreeToPrivacy.value === "on" &&
    !Object.values(fields).some((field) => (field.errors ?? []).length > 0);

  return (
    <form action={action} id={form.id} onSubmit={form.onSubmit} noValidate>
      <div className="flex flex-col gap-6">
        <AvatarUpload
          key={fields.avatar.key}
          name={fields.avatar.name}
          defaultValue={fields.avatar.defaultValue}
          error={fields.avatar.errors?.[0]}
        />

        <Input
          key={fields.username.key}
          name={fields.username.name}
          defaultValue={fields.username.defaultValue}
          label="ユーザー名"
          placeholder="ユーザー名を入力"
          error={fields.username.errors?.[0]}
          maxLength={MAX_USERNAME_LENGTH}
          currentLength={fields.username.value?.length ?? 0}
          autoComplete="off"
        />

        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              key={fields.agreeToTerms.key}
              name={fields.agreeToTerms.name}
              defaultChecked={fields.agreeToTerms.defaultValue === "on"}
              type="checkbox"
              className="size-4 cursor-pointer accent-warm-black"
            />
            <span className="text-sm text-warm-black">
              <a href="/terms" target="_blank" className="mr-1 font-bold hover:underline" rel="noopener">
                利用規約
              </a>
              に同意します
            </span>
          </label>

          <label className="flex items-center gap-3">
            <input
              key={fields.agreeToPrivacy.key}
              name={fields.agreeToPrivacy.name}
              defaultChecked={fields.agreeToPrivacy.defaultValue === "on"}
              type="checkbox"
              className="size-4 cursor-pointer accent-warm-black"
            />
            <span className="text-sm text-warm-black">
              <a href="/privacy" target="_blank" className="mr-1 font-bold hover:underline" rel="noopener">
                プライバシーポリシー
              </a>
              に同意します
            </span>
          </label>
        </div>

        <Button type="submit" variant="fill" className="w-full" disabled={!isFormValid}>
          新規登録
        </Button>
      </div>
    </form>
  );
}
