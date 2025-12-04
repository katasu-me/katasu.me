import type { ComponentProps } from "react";
import IconLoader2 from "@/assets/icons/loader-2.svg?react";
import Button from "@/components/Button";

type Props = Pick<ComponentProps<"button">, "className" | "disabled"> & {
  label: string;
  pendingLabel: string;
  isSubmitting?: boolean;
  variant?: ComponentProps<typeof Button>["variant"];
};

export default function FormSubmitButton({
  className,
  disabled,
  label,
  pendingLabel,
  isSubmitting = false,
  variant = "fill",
}: Props) {
  return (
    <Button type="submit" className={className} variant={variant} disabled={disabled}>
      {isSubmitting ? (
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
