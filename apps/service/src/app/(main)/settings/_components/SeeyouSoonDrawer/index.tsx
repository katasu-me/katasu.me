"use client";

import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithValibot } from "@conform-to/valibot";
import { useRouter } from "next/navigation";
import { type ComponentProps, useActionState, useEffect } from "react";
import Drawer from "@/components/Drawer";
import FormErrorMessage from "@/components/FormErrorMessage";
import Input from "@/components/Input";
import FormSubmitButton from "@/features/gallery/components/FormSubmitButton";
import { signOut } from "@/lib/auth-client";
import { deleteAccountAction } from "../../_actions/delete-account";
import { CONFIRMATION_TEXT, deleteAccountSchema } from "../../_schemas/delete-account";

type Props = Omit<ComponentProps<typeof Drawer>, "title" | "children">;

export default function SeeyouSoonDrawer(props: Props) {
  const router = useRouter();
  const [lastResult, action] = useActionState(deleteAccountAction, undefined);

  const [form, fields] = useForm({
    lastResult,
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    onValidate({ formData }) {
      return parseWithValibot(formData, {
        schema: deleteAccountSchema,
      });
    },
  });

  useEffect(() => {
    if (lastResult?.status === "success") {
      signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/");
          },
        },
      });
    }
  }, [lastResult, router]);

  const isFormValid = !Object.values(form.allErrors).length && fields.confirmation.value === CONFIRMATION_TEXT;

  return (
    <Drawer {...props} title="アカウントの削除">
      {({ Description }) => (
        <>
          <Description className="text-sm text-warm-black [&>span]:block">
            <span>アカウントを削除して、投稿した画像を削除します。</span>
            <span className="font-bold text-vivid-red">この操作は取り消すことができません！</span>
            <span className="mt-2">確認のため、「{CONFIRMATION_TEXT}」と入力してください</span>
          </Description>

          <form {...getFormProps(form)} className="mt-4" action={action} noValidate>
            {form.errors && form.errors?.length > 0 && <FormErrorMessage className="mb-4" text={form.errors[0]} />}

            <Input
              {...getInputProps(fields.confirmation, { type: "text" })}
              placeholder={CONFIRMATION_TEXT}
              error={fields.confirmation.errors?.[0]}
              autoComplete="off"
            />

            <FormSubmitButton
              className="mt-4 w-full"
              variant="danger"
              disabled={!isFormValid}
              label="削除する"
              pendingLabel="削除中…"
            />
          </form>
        </>
      )}
    </Drawer>
  );
}
