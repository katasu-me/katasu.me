"use client";

import { useState } from "react";
import { twMerge } from "tailwind-merge";
import IconPhotoPlus from "@/assets/icons/photo-plus.svg";
import ImageDrawer from "../ImageDrawer";

type Props = {
  title: string;
  className?: string;
};

export default function ImageDropArea({ title, className }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className={twMerge(
          "flex w-full items-center justify-center rounded-xl border border-warm-black-50 border-dashed bg-warm-white py-6 transition-filter duration-400 ease-magnetic hover:brightness-90",
          className,
        )}
        onClick={() => setOpen(true)}
      >
        <div className="flex items-center gap-2 text-sm tracking-wider">
          <IconPhotoPlus className="h-4 w-4" />
          <p>{title}</p>
        </div>
      </button>
      <ImageDrawer open={open} onOpenChange={(state) => setOpen(state)} />
    </>
  );
}
