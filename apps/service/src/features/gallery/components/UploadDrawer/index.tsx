import type { ComponentProps } from "react";
import Drawer from "@/components/Drawer";
import UploadForm from "./UploadForm";

type Props = ComponentProps<typeof UploadForm> & Pick<ComponentProps<typeof Drawer>, "open" | "onOpenChange">;

export default function UploadDrawer({ defaultImageFile, onSuccess, ...props }: Props) {
  return (
    <Drawer title="投稿する" {...props}>
      {({ Description }) => (
        <>
          <Description hidden>新しい画像を投稿するフォーム</Description>
          <UploadForm defaultImageFile={defaultImageFile} onSuccess={onSuccess} />
        </>
      )}
    </Drawer>
  );
}
