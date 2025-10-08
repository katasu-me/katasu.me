import type { ComponentProps } from "react";
import { useFormStatus } from "react-dom";
import IconLoader2 from "@/assets/icons/loader-2.svg";
import Button from "@/components/Button";

export default function SubmitButton({ disabled }: Pick<ComponentProps<"button">, "disabled">) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="mt-6 w-full" variant="fill" disabled={disabled || pending}>
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <IconLoader2 className="size-5 animate-spin" />
          投稿中…
        </span>
      ) : (
        "投稿"
      )}
    </Button>
  );
}
