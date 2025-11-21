import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import Button from "@/components/Button";
import Drawer from "@/components/Drawer";
import FormMessage from "@/components/FormMessage";
import Input from "@/components/Input";
import { CONFIRMATION_TEXT } from "@/features/settings/schemas/delete-account";
import { deleteAccountAction } from "@/features/settings/server-fn/delete-account";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export default function SeeyouSoonDrawer({ open, onOpenChange, onSuccess }: Props) {
  const deleteAccountFn = useServerFn(deleteAccountAction);
  const [confirmation, setConfirmation] = useState("");
  const [formError, setFormError] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState(false);

  const isConfirmationValid = confirmation === CONFIRMATION_TEXT;

  const handleDelete = async () => {
    if (!isConfirmationValid) {
      return;
    }

    setFormError("");
    setIsDeleting(true);

    try {
      const formData = new FormData();
      formData.append("confirmation", confirmation);

      const result = await deleteAccountFn({ data: formData });

      if (!result.success) {
        setFormError(result.error);
        setIsDeleting(false);
        return;
      }

      onSuccess?.();
    } catch (error) {
      if (error instanceof Error) {
        setFormError(error.message);
      }

      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setConfirmation("");
    setFormError("");
    onOpenChange(false);
  };

  return (
    <Drawer title="アカウントを削除する" open={open} onOpenChange={onOpenChange} dismissible={!isDeleting}>
      {({ Description, Close }) => (
        <div className="flex flex-col gap-6">
          <Description className="text-sm text-warm-black">
            アカウントを削除すると、投稿した画像やタグなどのデータがすべて削除されます。
            <br />
            この操作は取り消せません。
          </Description>

          {formError && <FormMessage type="error" text={formError} />}

          <div className="space-y-2">
            <p className="text-sm text-warm-black">
              削除を実行するには、以下に
              <span className="mx-1 font-bold">{CONFIRMATION_TEXT}</span>
              と入力してください。
            </p>
            <Input
              type="text"
              value={confirmation}
              onChange={(e) => {
                setConfirmation(e.target.value);
              }}
              placeholder={CONFIRMATION_TEXT}
              disabled={isDeleting}
            />
          </div>

          <div className="flex gap-4">
            <Close asChild>
              <Button variant="outline" onClick={handleCancel} className="flex-1" disabled={isDeleting}>
                やめる
              </Button>
            </Close>
            <Button
              variant="danger"
              onClick={handleDelete}
              className="flex-1"
              disabled={!isConfirmationValid || isDeleting}
            >
              {isDeleting ? "削除中…" : "削除する"}
            </Button>
          </div>
        </div>
      )}
    </Drawer>
  );
}
