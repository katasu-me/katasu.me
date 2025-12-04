import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import IconTrash from "@/assets/icons/trash.svg?react";
import Button from "@/components/Button";
import { deleteImageFn } from "../../server-fn/delete-image";

type Props = {
  userId: string;
  imageId: string;
};

export default function RemoveButton({ userId, imageId }: Props) {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = async () => {
    const confirmResult = window.confirm("この画像を削除しますか？ （もとに戻せません！）");

    if (!confirmResult) {
      return;
    }

    setIsDeleting(true);

    try {
      const result = await deleteImageFn({
        data: {
          userId,
          imageId,
        },
      });

      if (!result.success) {
        console.error("[RemoveButton] 画像の削除に失敗しました:", result.error);
        alert(`画像の削除に失敗しました: ${result.error}`);
        setIsDeleting(false);
        return;
      }

      // 削除成功時はリダイレクト
      navigate({ to: result.redirectTo });
    } catch (error) {
      console.error("[RemoveButton] 画像の削除に失敗しました:", error);
      alert("画像の削除に失敗しました");
      setIsDeleting(false);
    }
  };

  return (
    <Button className="flex items-center gap-1" variant="danger" onClick={handleDeleteClick} disabled={isDeleting}>
      <IconTrash className="h-4 w-4" />
      {isDeleting ? "削除中..." : "削除する"}
    </Button>
  );
}
