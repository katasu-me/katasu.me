import { useSuspenseQuery } from "@tanstack/react-query";
import { css } from "styled-system/css";
import Drawer from "@/components/Drawer";
import ImageDetail from "@/features/image-view/components/ImageDetail";
import { imagePageQueryOptions } from "@/features/image-view/server-fn/image-page";

type Props = {
  imageId: string;
  userSlug: string;
  sessionUserId?: string;
  onClose: () => void;
};

export default function ImageViewDrawer({ imageId, userSlug, sessionUserId, onClose }: Props) {
  const { data } = useSuspenseQuery(imagePageQueryOptions({ imageId }));

  return (
    <Drawer title="画像" titleClassname={css({ srOnly: true })} open onOpenChange={(open) => !open && onClose()}>
      {() => <ImageDetail image={data.image} userSlug={userSlug} sessionUserId={sessionUserId} />}
    </Drawer>
  );
}
