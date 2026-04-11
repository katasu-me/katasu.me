import type { ComponentProps } from "react";
import Button from "@/components/Button";
import LoaderIcon from "@/components/Icon/LucideAnimated/LoaderIcon";

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
          <LoaderIcon className="size-5" size={20} />
          {pendingLabel}
        </span>
      ) : (
        label
      )}
    </Button>
  );
}
