import type { ComponentProps } from "react";
import { useFormStatus } from "react-dom";
import IconLoader2 from "@/assets/icons/loader-2.svg";
import Button from "@/components/Button";

type Props = Pick<ComponentProps<"button">, "className" | "disabled"> & {
  label: string;
  pendingLabel: string;
};

export default function FormSubmitButton({ className, disabled, label, pendingLabel }: Props) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className={className} variant="fill" disabled={disabled || pending}>
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <IconLoader2 className="size-5 animate-spin" />
          {pendingLabel}
        </span>
      ) : (
        label
      )}
    </Button>
  );
}
