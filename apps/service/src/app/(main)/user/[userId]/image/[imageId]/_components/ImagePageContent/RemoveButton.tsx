"use client";

import { useState } from "react";
import IconTrash from "@/assets/icons/trash.svg";
import Button from "@/components/Button";
import { deleteImageAction } from "@/features/gallery/actions/delete";

type Props = {
  userId: string;
  imageId: string;
};

export default function RemoveButton({ userId, imageId }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = async () => {
    const confirmResult = window.confirm("この画像を削除しますか？ （もとに戻せません！）");

    if (!confirmResult) {
      return;
    }

    setIsDeleting(true);

    const error = await deleteImageAction(userId, imageId);

    if (error) {
      console.error("[gallery] 画像の削除に失敗しました:", error);
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
