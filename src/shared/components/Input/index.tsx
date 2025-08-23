import type { ComponentPropsWithRef, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

type Props = {
  maxLength?: number;
  currentLength?: number;
  className?: string;
  label?: ReactNode;
  error?: string;
} & ComponentPropsWithRef<"input">;

export default function Input({ maxLength, currentLength, className, label, error, ref, ...props }: Props) {
  const length = currentLength ?? props.value?.toString().length ?? 0;
  const hasBottom = error || maxLength;

  return (
    <div className={twMerge("w-full", className)}>
      {label && (
        <label htmlFor={props.id} className="mb-2 block font-medium text-sm text-warm-black">
          {label}
        </label>
      )}
      <input
        {...props}
        ref={ref}
        maxLength={maxLength}
        className="w-full rounded-md border border-warm-black-50 px-3 py-2 text-warm-black placeholder:text-warm-black-50 focus:border-warm-black focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100"
      />
      {hasBottom && (
        <div className="mt-1 flex items-center justify-end">
          {error && <p className="flex-1 text-red-600 text-sm">{error}</p>}
          {maxLength && (
            <span className="text-sm text-warm-black-100">
              {length}/{maxLength}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
