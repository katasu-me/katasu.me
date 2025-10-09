import { getFormProps, getInputProps, type SubmissionResult, useForm, useInputControl } from "@conform-to/react";
import { parseWithValibot } from "@conform-to/valibot";
import { motion } from "motion/react";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { twMerge } from "tailwind-merge";
import { DEFAULT_TRANSITION } from "@/constants/animation";
import { uploadAction } from "@/features/gallery/actions/upload";
import { usePreventFormReset } from "@/features/gallery/hooks/usePreventFormReset";
import {
  MAX_TAG_COUNT,
  MAX_TAG_TEXT_LENGTH,
  MAX_TITLE_LENGTH,
  uploadImageSchema,
} from "@/features/gallery/schemas/upload";
import FormErrorMessage from "../../FormErrorMessage";
import FormInputFields from "../../FormInputFields";
import FormSubmitButton from "../../FormSubmitButton";
import FrameImage from "../../FrameImage";
import ImagePlaceholder from "../../ImagePlaceholder";

type Props = {
  defaultImageFile?: File;
  defaultTags?: string[];
  onSuccess?: () => void;
  onPendingChange?: (pending: boolean) => void;
};

export type PreviewImage = {
  src: string;
  width: number;
  height: number;
};

const defaultResult: SubmissionResult<string[]> = {
  status: "error",
  error: {
    file: [""],
  },
};

export default function UploadForm({ defaultImageFile, defaultTags = [], onSuccess, onPendingChange }: Props) {
  const [lastResult, action] = useActionState(uploadAction, undefined);
  const [previewImage, setPreviewImage] = useState<PreviewImage | null>(null);
  const { pending } = useFormStatus();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isDnDFileSet = useRef(false);

  const [form, fields] = useForm({
    lastResult: lastResult || defaultResult,
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    onValidate({ formData }) {
      return parseWithValibot(formData, {
        schema: uploadImageSchema,
      });
    },
    defaultValue: {
      tags: defaultTags,
    },
  });

  const tagInput = useInputControl(fields.tags);
  const isFormValid = Object.values(form.allErrors).length === 0;

  // React 19で送信後にフォームがリセットされる問題のワークアラウンド
  usePreventFormReset(form.id, () => {
    setPreviewImage(null);
  });

  // DnDで渡された画像ファイルがあればプレビューにセット
  useEffect(() => {
    if (defaultImageFile) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();
        const imageSrc = e.target?.result as string;

        img.onload = () => {
          setPreviewImage({
            src: imageSrc,
            width: img.width,
            height: img.height,
          });
        };

        img.src = imageSrc;
      };

      reader.readAsDataURL(defaultImageFile);
    }
  }, [defaultImageFile]);

  // アップロード成功時にコールバック発火
  useEffect(() => {
    if (lastResult?.status === "success") {
      onSuccess?.();
    }
  }, [lastResult, onSuccess]);

  // pending状態を親に通知
  useEffect(() => {
    onPendingChange?.(pending);
  }, [pending, onPendingChange]);

  const setFileInputRef = (input: HTMLInputElement | null) => {
    fileInputRef.current = input;

    // DnDで渡された画像ファイルがあればセット
    if (!isDnDFileSet.current && input && defaultImageFile) {
      const dt = new DataTransfer();

      dt.items.add(defaultImageFile);
      input.files = dt.files;

      form.validate({ name: fields.file.name });

      isDnDFileSet.current = true;
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;

    // 画像が選択されなかった場合はリセット
    if (!file) {
      setPreviewImage(null);
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      const imageSrc = e.target?.result as string;

      img.onload = () => {
        setPreviewImage({
          src: imageSrc,
          width: img.width,
          height: img.height,
        });
      };

      img.src = imageSrc;
    };

    reader.readAsDataURL(file);
  };

  const handlePreviewClick = () => {
    fileInputRef.current?.click();
  };

  const handleTagChange = (tags: string[]) => {
    tagInput.change(tags);
  };

  return (
    <form {...getFormProps(form)} action={action} noValidate>
      <input
        {...getInputProps(fields.file, { type: "file" })}
        ref={setFileInputRef}
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* 画像のプレビュー */}
      <button
        type="button"
        className={twMerge("block w-full cursor-pointer", !pending && "mb-4")}
        onClick={handlePreviewClick}
        aria-label="画像を選択"
        disabled={pending}
      >
        <motion.div
          animate={
            pending
              ? {
                  rotate: [1, -2, 3, -2, 1],
                  transition: {
                    duration: 0.6,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatDelay: 1,
                    ease: "easeInOut",
                  },
                }
              : {
                  rotate: 1,
                  scale: 1,
                }
          }
          whileHover={!pending ? { scale: 1.05 } : undefined}
          transition={DEFAULT_TRANSITION}
        >
          {previewImage ? (
            <FrameImage
              src={previewImage.src}
              width={previewImage.width || 2560}
              height={previewImage.height || 1440}
              alt="画像のプレビュー"
              className={twMerge(
                "mx-auto",
                previewImage.width > previewImage.height ? "h-auto w-full" : "max-h-64 w-auto",
              )}
            />
          ) : (
            <ImagePlaceholder />
          )}
        </motion.div>
      </button>

      {/* フォームのエラー */}
      {form.errors && form.errors?.length > 0 && <FormErrorMessage text={form.errors[0]} />}
      {fields.file.errors?.at(0) && <FormErrorMessage text={fields.file.errors[0]} />}

      {/* タイトル・タグ入力欄 */}
      <motion.div
        className="flex flex-col gap-4 overflow-hidden"
        animate={{
          opacity: pending ? 0 : 1,
          height: pending ? 0 : "auto",
        }}
        transition={DEFAULT_TRANSITION}
      >
        <FormInputFields
          fields={{ title: fields.title, tags: fields.tags }}
          tagInput={tagInput}
          handleTagChange={handleTagChange}
          titlePlaceholder="すてきな画像"
          tagPlaceholder="風景とか…"
          maxTitleLength={MAX_TITLE_LENGTH}
          maxTagCount={MAX_TAG_COUNT}
          maxTagTextLength={MAX_TAG_TEXT_LENGTH}
          disabled={pending}
        />
      </motion.div>

      <FormSubmitButton disabled={!isFormValid} label="投稿" pendingLabel="投稿中…" />
    </form>
  );
}
