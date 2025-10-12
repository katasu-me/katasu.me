import { getFormProps, getInputProps, type SubmissionResult, useForm, useInputControl } from "@conform-to/react";
import { parseWithValibot } from "@conform-to/valibot";
import { motion } from "motion/react";
import { useActionState, useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import FormErrorMessage from "@/components/FormErrorMessage";
import { DEFAULT_TRANSITION } from "@/constants/animation";
import { uploadAction } from "@/features/gallery/actions/upload";
import { usePreventFormReset } from "@/features/gallery/hooks/usePreventFormReset";
import {
  MAX_TAG_COUNT,
  MAX_TAG_TEXT_LENGTH,
  MAX_TITLE_LENGTH,
  uploadImageSchema,
} from "@/features/gallery/schemas/upload";
import FormInputFields from "../../FormInputFields";
import FormSubmitButton from "../../FormSubmitButton";
import FrameImage from "../../FrameImage";
import ImagePlaceholder from "../../ImagePlaceholder";

type Props = {
  isPending: boolean;
  onPendingChange: (pending: boolean) => void;
  defaultImageFile?: File;
  defaultTags?: string[];
  onSuccess?: () => void;
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

export default function UploadForm({
  isPending,
  onPendingChange,
  defaultImageFile,
  defaultTags = [],
  onSuccess,
}: Props) {
  const [lastResult, action] = useActionState(uploadAction, undefined);
  const [previewImage, setPreviewImage] = useState<PreviewImage | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isDnDFileSet = useRef(false);
  const prevResultRef = useRef(lastResult);

  const [form, fields] = useForm({
    lastResult: lastResult || defaultResult,
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    onValidate({ formData }) {
      return parseWithValibot(formData, {
        schema: uploadImageSchema,
      });
    },
    onSubmit: () => {
      onPendingChange(true);
    },
    defaultValue: {
      tags: defaultTags,
    },
  });

  const tagInput = useInputControl(fields.tags);
  const isFormValid = Object.values(form.allErrors).length === 0;

  // 結果の変化を検知
  if (lastResult !== prevResultRef.current) {
    prevResultRef.current = lastResult;

    // レンダリング後に実行
    queueMicrotask(() => {
      onPendingChange(false);

      if (lastResult?.status === "success") {
        onSuccess?.();
      }
    });
  }

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
      {/* フォームのエラー */}
      {form.errors && form.errors?.length > 0 && <FormErrorMessage className="mb-4" text={form.errors[0]} />}

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
        className={twMerge("block w-full cursor-pointer", !isPending && "mb-4")}
        onClick={handlePreviewClick}
        aria-label="画像を選択"
        disabled={isPending}
      >
        <motion.div
          initial={false}
          animate={
            isPending
              ? {
                  scale: [0.98, 1.015, 0.99, 1.025, 0.985, 1.02, 0.98], // ゆらいでいるイメージ
                  opacity: [0.3, 0.7, 0.85, 0.95, 1, 1, 1],
                  filter: ["blur(8px)", "blur(4px)", "blur(2px)", "blur(3px)", "blur(1px)", "blur(0.5px)", "blur(0px)"],
                  transition: {
                    scale: {
                      duration: 4.8,
                      times: [0, 0.15, 0.28, 0.5, 0.65, 0.82, 1],
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    },
                    opacity: {
                      duration: 4.8,
                      times: [0, 0.15, 0.28, 0.5, 0.65, 0.82, 1],
                      ease: "easeOut",
                    },
                    filter: {
                      duration: 4.8,
                      times: [0, 0.15, 0.28, 0.5, 0.65, 0.82, 1],
                      ease: "easeOut",
                    },
                  },
                }
              : {
                  scale: 1,
                  opacity: 1,
                  filter: "blur(0px)",
                }
          }
          whileHover={!isPending ? { scale: 1.05 } : undefined}
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

      {/* 画像のエラー */}
      {fields.file.errors?.at(0) && <FormErrorMessage text={fields.file.errors[0]} />}

      {/* タイトル・タグ入力欄 */}
      <motion.div
        className="flex flex-col gap-4 overflow-hidden"
        animate={{
          opacity: isPending ? 0 : 1,
          height: isPending ? 0 : "auto",
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
          disabled={isPending}
        />
      </motion.div>

      <FormSubmitButton disabled={!isFormValid} label="投稿" pendingLabel="投稿中…" />
    </form>
  );
}
