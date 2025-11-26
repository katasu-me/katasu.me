import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import IconPencil from "@/assets/icons/pencil.svg?react";
import Button from "@/components/Button";
import EditDrawer from "../EditDrawer";

type Props = {
  imageId: string;
  title?: string | null;
  tags: string[];
};

export default function EditButton({ imageId, title, tags }: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = () => {
    // モーダルを閉じる
    setIsOpen(false);

    // アニメーション完了を待ってからページをリフレッシュ
    setTimeout(async () => {
      await router.invalidate({
        sync: true,
      });
    }, 400);
  };

  return (
    <>
      <Button className="flex items-center gap-1" onClick={() => setIsOpen(true)}>
        <IconPencil className="h-4 w-4" />
        <span className="text-sm">編集する</span>
      </Button>

      <EditDrawer
        open={isOpen}
        onOpenChange={setIsOpen}
        imageId={imageId}
        defaultTitle={title ?? undefined}
        defaultTags={tags}
        onSuccess={handleSuccess}
      />
    </>
  );
}
