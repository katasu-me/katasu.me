import type { ComponentProps } from "react";
import Drawer from "@/components/Drawer";
import EditForm from "./EditForm";

type Props = ComponentProps<typeof EditForm> & Pick<ComponentProps<typeof Drawer>, "open" | "onOpenChange">;

export default function EditDrawer({ imageId, defaultTitle, defaultTags, onSuccess, ...props }: Props) {
  return (
    <Drawer title="投稿を編集する" {...props}>
      {({ Description }) => (
        <>
          <Description hidden>投稿画像を編集するフォーム</Description>
          <EditForm imageId={imageId} defaultTitle={defaultTitle} defaultTags={defaultTags} onSuccess={onSuccess} />
        </>
      )}
    </Drawer>
  );
}
