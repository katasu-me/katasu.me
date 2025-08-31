"use client";

import Image from "next/image";
import { type ComponentPropsWithoutRef, useCallback, useRef, useState } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { twMerge } from "tailwind-merge";
import IconClose from "@/assets/icons/close.svg";
import IconPlus from "@/assets/icons/plus.svg";
import Button from "@/shared/components/Button";
import Drawer from "@/shared/components/Drawer";
import { getCroppedImg } from "../../utils/cropImage";

type Props = {
  onFileChange?: (file: File | null) => void;
  error?: string;
  className?: string;
} & Omit<ComponentPropsWithoutRef<"input">, "type" | "accept" | "onChange">;

export default function AvatarUpload({ onFileChange, error, className, ...props }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        setImageSrc(e.target?.result as string);
        setIsDrawerOpen(true);
      };

      reader.readAsDataURL(file);
    } else {
      setPreview(null);
      onFileChange?.(null);
    }
  };

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) {
      return;
    }

    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);

      if (croppedBlob) {
        const file = new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" });
        onFileChange?.(file);

        const url = URL.createObjectURL(croppedBlob);
        setPreview(url);
      }

      setIsDrawerOpen(false);
      resetCrop();
    } catch (error) {
      console.error("画像のクロップに失敗しました:", error);
    }
  };

  const handleCancel = () => {
    setIsDrawerOpen(false);
    resetCrop();

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const resetCrop = () => {
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    onFileChange?.(null);
  };

  return (
    <div className={twMerge("flex flex-col items-center gap-2", className)}>
      <div className="relative">
        <button
          type="button"
          onClick={handleClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleClick();
            }
          }}
          className="group interactive-scale-brightness relative size-24 cursor-pointer overflow-hidden rounded-full border-2 border-warm-black-50 border-dashed bg-warm-white"
        >
          {preview ? (
            <>
              <Image src={preview} alt="プレビュー" fill className="object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-400 ease-magnetic group-hover:opacity-100">
                <span className="text-white text-xs">変更</span>
              </div>
            </>
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-1">
              <IconPlus className="h-4 w-4" />
              <span className="text-warm-black-50 text-xs">アイコン</span>
            </div>
          )}
        </button>

        {preview && (
          <button
            type="button"
            onClick={handleRemove}
            className="interactive-scale-brightness absolute top-0 right-0 flex size-6 cursor-pointer items-center justify-center rounded-full border border-warm-white bg-warm-black text-white text-xs"
          >
            <IconClose className="h-4 w-4" />
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
        {...props}
      />

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <Drawer
        title="アイコンをクロップ"
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        innerClassname="max-w-2xl"
        handleOnly
      >
        {({ Close }) => (
          <div className="flex flex-col gap-4">
            <div className="relative h-96 w-full overflow-hidden rounded-lg bg-warm-black-50/10">
              {imageSrc && (
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                  cropShape="round"
                  showGrid={true}
                />
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2">
                <span className="text-sm text-warm-black">ズーム:</span>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-1 accent-warm-black"
                />
                <span className="w-12 text-sm text-warm-black-50">{zoom.toFixed(1)}x</span>
              </label>
            </div>

            <div className="flex gap-4">
              <Close asChild>
                <Button variant="outline" onClick={handleCancel} className="flex-1">
                  キャンセル
                </Button>
              </Close>
              <Button variant="fill" onClick={handleCropConfirm} className="flex-1">
                完了
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
