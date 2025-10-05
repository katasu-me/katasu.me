import type { ComponentProps } from "react";
import Drawer from "@/components/Drawer";
import EditImageForm from "./EditImageForm";

type Props = ComponentProps<typeof EditImageForm> & Pick<ComponentProps<typeof Drawer>, "open" | "onOpenChange">;

export default function EditImageDrawer({ imageId, defaultTitle, defaultTags, onSuccess, ...props }: Props) {
  return (
    <Drawer title="投稿を編集する" {...props}>
      {({ Description }) => (
        <>
          <Description hidden>投稿画像を編集するフォーム</Description>
          <EditImageForm
            imageId={imageId}
            defaultTitle={defaultTitle}
            defaultTags={defaultTags}
            onSuccess={onSuccess}
          />
        </>
      )}
    </Drawer>
  );
}
