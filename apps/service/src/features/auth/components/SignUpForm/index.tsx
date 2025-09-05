"use client";

import { getFormProps, getInputProps, SubmissionResult, useForm } from "@conform-to/react";
import { parseWithValibot } from "@conform-to/valibot";
import { useActionState } from "react";
import Button from "@/shared/components/Button";
import Input from "@/shared/components/Input";
import { signupAction } from "../../actions/signup";
import { MAX_USERNAME_LENGTH, signUpFormSchema } from "../../schemas/signup-form";
import AvatarUpload from "../AvatarUpload";

// MEMO: 初期状態でエラーの状態にしておくことで先に進めないようにする
const defaultResult: SubmissionResult<string[]> = {
  status: 'error',
  error: {
    agreeToTerms: ["利用規約への同意が必要です"],
    agreeToPrivacy: ["プライバシーポリシーへの同意が必要です"]
  }
}

export default function SignUpForm() {
  const [lastResult, action] = useActionState(signupAction, undefined);

  const [form, fields] = useForm({
    lastResult: lastResult || defaultResult,
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    onValidate({ formData }) {
      return parseWithValibot(formData, {
        schema: signUpFormSchema,
      });
    },
  });

  // MEMO: trim()剥がしたかったけどisDirtyが実装されるまでは無理そう
  const isFormValid = !Object.values(form.allErrors).length && fields.username.value?.trim();

  return (
    <form {...getFormProps(form)} action={action} noValidate>
      <div className="flex flex-col gap-6">
        <AvatarUpload
          {...getInputProps(fields.avatar, { type: 'file' })}
          error={fields.avatar.errors?.[0]}
        />

        <Input
          {...getInputProps(fields.username, { type: 'text' })}
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
              {...getInputProps(fields.agreeToTerms, { type: 'checkbox' })}
              className="size-4 cursor-pointer accent-warm-black"
              required={true}
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
              {...getInputProps(fields.agreeToPrivacy, { type: 'checkbox' })}
              className="size-4 cursor-pointer accent-warm-black"
              required={true}
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
