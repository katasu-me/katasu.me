import { useForm } from "@tanstack/react-form";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import AvatarUpload from "@/components/AvatarUpload";
import FormMessage from "@/components/FormMessage";
import FormSubmitButton from "@/components/FormSubmitButton";
import Input from "@/components/Input";
import { type UserSettingsFormInput, userSettingsFormSchema } from "@/features/settings/schemas/user-settings";
import { MAX_USERNAME_LENGTH } from "@/schemas/user";
import { updateUserSettingsFn } from "../../server-fn/update-user-settings";

type Props = {
  user: {
    name: string;
    avatarUrl: string | null;
  };
  onSuccess?: () => void;
  className?: string;
};

export default function UserSettingsForm({ user, onSuccess, className }: Props) {
  const router = useRouter();
  const updateUserSettings = useServerFn(updateUserSettingsFn);
  const [formError, setFormError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [shouldRemoveAvatar, setShouldRemoveAvatar] = useState(false);

  const defaultValues: UserSettingsFormInput = {
    username: user.name,
    removeAvatar: false,
  };

  const form = useForm({
    defaultValues,
    validators: {
      onMount: userSettingsFormSchema,
      onChange: userSettingsFormSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError("");
      setSuccessMessage("");

      try {
        const formData = new FormData();
        formData.append("username", value.username);

        if (value.avatar) {
          // アイコンを更新する
          formData.append("avatar", value.avatar);
          formData.append("removeAvatar", "false");
        } else {
          // アイコンを削除する
          formData.append("removeAvatar", shouldRemoveAvatar.toString());
        }

        const result = await updateUserSettings({ data: formData });

        if (!result.success) {
          setFormError(result.error);
          return;
        }

        setSuccessMessage("設定を保存しました");
        await router.invalidate({
          sync: true,
        });
        onSuccess?.();
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
        <form.Field name="avatar">
          {(field) => (
            <AvatarUpload
              name={field.name}
              defaultAvatarUrl={user.avatarUrl ?? undefined}
              onFileChange={(file) => {
                setShouldRemoveAvatar(!file);
                field.handleChange(file ?? undefined);
              }}
              error={
                field.state.meta.errors.length > 0 && !field.state.meta.errorMap.onMount
                  ? field.state.meta.errors.at(0)?.message
                  : undefined
              }
            />
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
                  ? field.state.meta.errors.at(0)?.message
                  : undefined
              }
              maxLength={MAX_USERNAME_LENGTH}
              currentLength={field.state.value?.length ?? 0}
              autoComplete="off"
            />
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
