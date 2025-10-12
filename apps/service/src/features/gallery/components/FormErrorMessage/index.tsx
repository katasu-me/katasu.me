import IconExclamationCircle from "@/assets/icons/exclamation-circle.svg";

type Props = {
  text: string;
};

/**
 * フォームエラーメッセージを表示する共通コンポーネント
 */
export default function FormErrorMessage({ text }: Props) {
  return (
    <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-600 bg-red-50 p-4">
      <IconExclamationCircle className="size-6 text-red-600" />
      <p className="text-red-600 text-sm">{text}</p>
    </div>
  );
}
