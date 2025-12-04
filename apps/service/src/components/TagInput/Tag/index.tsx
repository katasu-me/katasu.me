import IconX from "@/assets/icons/close.svg?react";

type Props = {
  tagName: string;
  onClickRemove?: () => void;
  disabled?: boolean;
};

export default function Tag({ tagName, onClickRemove, disabled = false }: Props) {
  return (
    <span className="inline-flex items-center gap-1 rounded bg-warm-black px-2 py-1 font-medium text-gray-700 text-warm-white text-xs">
      {`#${tagName}`}
      {!disabled && (
        <button
          type="button"
          className="interactive-scale-brightness ml-1 rounded-full text-warm-white"
          onClick={onClickRemove}
          aria-label={`${tagName}を削除`}
        >
          <IconX className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
