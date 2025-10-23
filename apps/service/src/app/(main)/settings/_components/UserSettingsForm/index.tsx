"use client";

import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithValibot } from "@conform-to/valibot";
import { useActionState, useEffect, useRef, useState } from "react";
import AvatarUpload from "@/components/AvatarUpload";
import FormErrorMessage from "@/components/FormErrorMessage";
import FormSubmitButton from "@/components/FormSubmitButton";
import Input from "@/components/Input";
import { MAX_USERNAME_LENGTH } from "@/schemas/user";
import { updateUserSettingsAction } from "../../_actions/update-user-settings";
import { userSettingsFormSchema } from "../../_schemas/user-settings";

type Props = {
  className?: string;
  defaultUsername: string;
  defaultUserAvatar?: string;
};

export default function UserSettingsForm({ className, defaultUsername, defaultUserAvatar }: Props) {
  const [lastResult, action] = useActionState(updateUserSettingsAction, undefined);
  const hasAvatarChange = useRef(false);
  const [removeAvatar, setRemoveAvatar] = useState(false);

  const [form, fields] = useForm({
    lastResult,
    defaultValue: {
      username: defaultUsername,
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    onValidate({ formData }) {
      return parseWithValibot(formData, {
        schema: userSettingsFormSchema,
      });
    },
  });

  /**
   * 挿入されたファイルを検証させる関数
   * - AvatarUploadでonChangeを乗っ取っているためgetInputPropsのonChangeが効かない。
   * - なので、onFileChangeでvalidateを呼び出すようにする。
   */
  const handleAvatarChange = (file: File | null) => {
    // バツボタンで削除された場合
    if (file === null) {
      hasAvatarChange.current = true;
      setRemoveAvatar(true);
    }
    // アイコン画像が変更された場合
    else {
      hasAvatarChange.current = true;
      setRemoveAvatar(false);
    }

    form.validate({ name: fields.avatar.name });
  };

  // 更新できたら画面を更新
  useEffect(() => {
    if (lastResult?.status === "success") {
      hasAvatarChange.current = false;
      setRemoveAvatar(false);
      window.location.reload(); // FIXME: 効いてないので、フォームのkeyを更新して破棄するようにする。ヘッダーはまぁいいんじゃないかな
    }
  }, [lastResult]);

  // 変更があるかチェック
  const hasUsernameChange = fields.username.value?.trim() !== defaultUsername;
  const hasChanges = hasUsernameChange || hasAvatarChange.current;

  const isFormValid = !Object.values(form.allErrors).length && fields.username.value?.trim() && hasChanges;

  return (
    <form {...getFormProps(form)} className={className} action={action} noValidate>
      {/* フォームのエラー */}
      {form.errors && form.errors?.length > 0 && <FormErrorMessage className="mb-16" text={form.errors[0]} />}

      <div className="flex pc:w-sm w-full flex-col gap-6">
        <AvatarUpload
          {...getInputProps(fields.avatar, { type: "file" })}
          error={fields.avatar.errors?.[0]}
          onFileChange={handleAvatarChange}
          defaultAvatarUrl={defaultUserAvatar}
        />

        <Input
          {...getInputProps(fields.username, { type: "text" })}
          label="ユーザー名"
          placeholder="すてきな名前"
          error={fields.username.errors?.[0]}
          maxLength={MAX_USERNAME_LENGTH}
          currentLength={fields.username.value?.length ?? 0}
          autoComplete="off"
        />

        <input type="hidden" name="removeAvatar" value={removeAvatar.toString()} />

        <FormSubmitButton className="w-full" disabled={!isFormValid} label="更新する" pendingLabel="更新中…" />
      </div>
    </form>
  );
}
