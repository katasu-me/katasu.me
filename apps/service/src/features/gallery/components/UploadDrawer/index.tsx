import { type ComponentProps, useState } from "react";
import Drawer from "@/components/Drawer";
import UploadForm from "./UploadForm";

type Props = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
} & Omit<ComponentProps<typeof UploadForm>, "onPendingChange">;

export default function UploadDrawer({ open, onOpenChange, ...uploadFormProps }: Props) {
  const [isPending, setIsPending] = useState(false);

  return (
    <Drawer title="投稿する" open={open} onOpenChange={onOpenChange} dismissible={!isPending}>
      {({ Description }) => (
        <>
          <Description hidden>新しい画像を投稿するフォーム</Description>
          <UploadForm {...uploadFormProps} onPendingChange={setIsPending} />
        </>
      )}
    </Drawer>
  );
}
