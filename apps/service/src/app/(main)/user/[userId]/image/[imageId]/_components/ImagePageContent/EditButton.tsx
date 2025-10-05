"use client";

import { useState } from "react";
import IconPencil from "@/assets/icons/pencil.svg";
import Button from "@/components/Button";
import EditImageDrawer from "@/features/gallery/components/EditImageDrawer";

type Props = {
  imageId: string;
  title?: string | null;
  tags: string[];
};

export default function EditButton({ imageId, title, tags }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button className="flex items-center gap-1" onClick={() => setIsOpen(true)}>
        <IconPencil className="h-4 w-4" />
        <span className="text-sm">編集する</span>
      </Button>

      <EditImageDrawer
        open={isOpen}
        onOpenChange={setIsOpen}
        imageId={imageId}
        defaultTitle={title ?? undefined}
        defaultTags={tags}
        onSuccess={() => {
          setIsOpen(false);
        }}
      />
    </>
  );
}
