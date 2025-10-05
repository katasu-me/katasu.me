import { useFormStatus } from "react-dom";
import Button from "@/components/Button";

type Props = {
  disabled: boolean;
};

export default function SubmitButton({ disabled }: Props) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={disabled || pending} className="w-full">
      {pending ? "変更中..." : "変更"}
    </Button>
  );
}
