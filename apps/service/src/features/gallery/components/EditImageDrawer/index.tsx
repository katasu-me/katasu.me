import type { ComponentProps } from "react";
import Drawer from "@/components/Drawer";
import EditImageForm from "./EditImageForm";

type Props = ComponentProps<typeof EditImageForm> & Pick<ComponentProps<typeof Drawer>, "open" | "onOpenChange">;

export default function EditImageDrawer({
  imageId,
  imageSrc,
  imageWidth,
  imageHeight,
  defaultTitle,
  defaultTags,
  onSuccess,
  ...props
}: Props) {
  return (
    <Drawer title="画像を編集" {...props}>
      {({ Description }) => (
        <>
          <Description hidden>画像のタイトルとタグを編集するフォーム</Description>
          <EditImageForm
            imageId={imageId}
            imageSrc={imageSrc}
            imageWidth={imageWidth}
            imageHeight={imageHeight}
            defaultTitle={defaultTitle}
            defaultTags={defaultTags}
            onSuccess={onSuccess}
          />
        </>
      )}
    </Drawer>
  );
}
