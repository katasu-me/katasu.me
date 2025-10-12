"use client";

import Image from "next/image";
import {
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
  type MouseEvent,
  useRef,
  useState,
} from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { twMerge } from "tailwind-merge";
import IconClose from "@/assets/icons/close.svg";
import IconPlus from "@/assets/icons/plus.svg";
import IconReload from "@/assets/icons/reload.svg";
import IconZoomIn from "@/assets/icons/zoom-in.svg";
import IconZoomOut from "@/assets/icons/zoom-out.svg";
import Button from "@/components/Button";
import Drawer from "@/components/Drawer";
import FormErrorMessage from "@/components/FormErrorMessage";
import { getCroppedImg } from "../../lib/cropImage";

type Props = {
  onFileChange?: (file: File | null) => void;
  error?: string;
  className?: string;
} & Omit<ComponentPropsWithoutRef<"input">, "type" | "accept" | "onChange">;

const DEFAULT_CROP_VALUE = {
  x: 0,
  y: 0,
} as const;

const DEFAULT_ZOOM_VALUE = 1;

export default function AvatarUpload({ onFileChange, error, className, ...props }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>(DEFAULT_CROP_VALUE);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM_VALUE);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;

    if (!file) {
      setPreview(null);
      onFileChange?.(null);
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      setImageSrc(e.target?.result as string);
      setIsDrawerOpen(true);
    };

    reader.readAsDataURL(file);
  };

  const handleCropComplete = (_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

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

  const handleRemoveClick = (e: MouseEvent) => {
    e.stopPropagation();
    setPreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    onFileChange?.(null);
  };

  const handleZoomChange = (e: ChangeEvent<HTMLInputElement>) => {
    const zoom = Number.parseFloat(e.target.value);
    setZoom(zoom);
  };

  const resetCrop = () => {
    setImageSrc(null);
    setCrop(DEFAULT_CROP_VALUE);
    setZoom(DEFAULT_ZOOM_VALUE);
    setCroppedAreaPixels(null);
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={twMerge("flex flex-col items-center gap-2", className)}>
      <div className="relative">
        <button
          type="button"
          onClick={openFilePicker}
          onKeyDown={handleKeyDown}
          className="group interactive-scale-brightness relative size-48 cursor-pointer overflow-hidden rounded-full border-2 border-warm-black-50 border-dashed bg-warm-white"
        >
          {preview ? (
            <>
              <Image src={preview} alt="アイコンのプレビュー" fill className="object-cover" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50 text-white opacity-0 transition-opacity duration-400 ease-magnetic group-hover:opacity-100">
                <IconReload className="size-5" />
                <span className="text-sm">やっぱり変える</span>
              </div>
            </>
          ) : (
            <>
              <IconPlus className="mx-auto size-5 text-warm-black-50" />
              <span className="mt-2 block text-sm text-warm-black-50">アイコンを追加</span>
              <span className="mt-1 block text-warm-black-50 text-xs">(なくてもいいよ)</span>
            </>
          )}
        </button>

        {preview && (
          <button
            type="button"
            onClick={handleRemoveClick}
            className="interactive-scale-brightness absolute top-2 right-2 flex size-9 cursor-pointer items-center justify-center rounded-full border border-warm-white bg-warm-black text-white text-xs"
          >
            <IconClose className="size-5" />
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

      {error && <FormErrorMessage className="w-full" text={error} />}

      <Drawer
        title="アイコンを切り抜く"
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        innerClassname="max-w-2xl"
        handleOnly
      >
        {({ Description, Close }) => (
          <div className="flex flex-col gap-8">
            <Description hidden>アップロードした画像を切り抜いてください</Description>
            <div className="relative h-96 w-full overflow-hidden rounded-lg bg-warm-black-50/10">
              {imageSrc && (
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onCropComplete={handleCropComplete}
                  onZoomChange={setZoom}
                  cropShape="round"
                  showGrid={true}
                />
              )}
            </div>

            <div className="flex items-center gap-3">
              <IconZoomOut className="size-5" />
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.01}
                onChange={handleZoomChange}
                className="flex-1 accent-warm-black"
              />
              <IconZoomIn className="size-5" />
            </div>

            <div className="flex gap-4">
              <Close asChild>
                <Button variant="outline" onClick={handleCancel} className="flex-1">
                  やめる
                </Button>
              </Close>
              <Button variant="fill" onClick={handleCropConfirm} className="flex-1">
                これでOK
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
