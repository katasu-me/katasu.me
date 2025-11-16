import { type ComponentProps, useState } from "react";
import Drawer from "@/components/Drawer";
import UploadForm from "../UploadForm";
import FilmCounter from "./FilmCounter";

type Props = {
  counter: ComponentProps<typeof FilmCounter>;

  open?: boolean;
  onOpenChange?: (open: boolean) => void;
} & Omit<ComponentProps<typeof UploadForm>, "isPending" | "onPendingChange">;

export default function UploadDrawer({ counter, open, onOpenChange, ...uploadFormProps }: Props) {
  const [isPending, setIsPending] = useState(false);

  return (
    <Drawer
      title={
        <>
          <span>投稿する</span>
          <FilmCounter {...counter} />
        </>
      }
      titleClassname="flex items-center justify-between"
      open={open}
      onOpenChange={onOpenChange}
      dismissible={!isPending}
    >
      {({ Description }) => (
        <>
          <Description hidden>新しい画像を投稿するフォーム</Description>
          <UploadForm {...uploadFormProps} isPending={isPending} onPendingChange={(state) => setIsPending(state)} />
        </>
      )}
    </Drawer>
  );
}
