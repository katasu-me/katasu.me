import { useForm } from "@tanstack/react-form";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import FormMessage from "@/components/FormMessage";
import FormSubmitButton from "@/components/FormSubmitButton";
import FrameImage from "@/components/FrameImage";
import Input from "@/components/Input";
import TagInput from "@/components/TagInput";
import { DEFAULT_TRANSITION } from "@/constants/animation";
import {
  MAX_TAG_COUNT,
  MAX_TAG_TEXT_LENGTH,
  MAX_TITLE_LENGTH,
  type UploadImageFormData,
  uploadImageClientSchema,
} from "@/features/image-upload/schemas/upload";
import { normalizeFile } from "@/libs/work-around";
import { UPLOAD_ERROR_MESSAGE } from "../../constants/error";
import { useUpload } from "../../contexts/UploadContext";
import ImagePlaceholder from "./ImagePlaceholder";

type Props = {
  onPendingChange: (pending: boolean) => void;
  defaultImageFile?: File;
  defaultTags?: string[];
  defaultTitle?: string;
};

export type PreviewImage = {
  src: string;
  width: number;
  height: number;
};

export default function UploadForm({ onPendingChange, defaultImageFile, defaultTags = [], defaultTitle }: Props) {
  const { state, upload, prepareFile, tempModerationFlagged } = useUpload();
  const [previewImage, setPreviewImage] = useState<PreviewImage | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isDnDFileSet = useRef(false);
  const previewUrlRef = useRef<string | null>(null);
  const prepareRequestIdRef = useRef(0);

  const isUploading = state.status === "uploading";
  const formError = state.status === "error" ? state.error : "";

  const defaultValues: UploadImageFormData = {
    file: new File([], ""),
    title: defaultTitle,
    tags: defaultTags,
  };

  const form = useForm({
    defaultValues,
    validators: {
      onMount: uploadImageClientSchema,
      onChange: uploadImageClientSchema,
    },
    onSubmit: async ({ value }) => {
      onPendingChange(true);

      upload(value.file, {
        title: value.title,
        tags: value.tags,
      });

      onPendingChange(false);
    },
  });

  /**
   * ファイル選択・DnDの両方から呼ばれる
   *
   * フォーム入力中に転送を済ませて投稿時の待ち時間を短縮するため、
   * この時点で先行処理（リサイズ・ThumbHash計算・一時アップロード）を開始する
   */
  const applyFile = useCallback(
    async (file: File) => {
      // 先行処理の完了を待たずにバリデーションを効かせる（処理完了後に処理済みファイルへ差し替える）
      form.setFieldValue("file", file);

      // 処理中に別ファイルへ差し替えられた場合、古い結果でプレビューを上書きしないようにする
      const requestId = ++prepareRequestIdRef.current;
      const prepared = await prepareFile(file);

      if (requestId !== prepareRequestIdRef.current) {
        return;
      }

      // デコードできないファイルはプレビューせず、投稿時のエラー表示に任せる
      if (!prepared.processed) {
        return;
      }

      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }

      const src = URL.createObjectURL(prepared.processed.file);
      previewUrlRef.current = src;

      setPreviewImage({
        src,
        width: prepared.processed.width,
        height: prepared.processed.height,
      });

      form.setFieldValue("file", prepared.processed.file);
    },
    [prepareFile, form.setFieldValue],
  );

  // DnDで渡されたファイルをセット
  useEffect(() => {
    if (!defaultImageFile) {
      return;
    }

    applyFile(defaultImageFile);
  }, [defaultImageFile, applyFile]);

  // アンマウント時にプレビュー用のオブジェクトURLを解放する
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const setFileInputRef = (input: HTMLInputElement | null) => {
    fileInputRef.current = input;

    if (!isDnDFileSet.current && input && defaultImageFile) {
      normalizeFile(defaultImageFile).then((file) => {
        const dt = new DataTransfer();
        dt.items.add(file);
        input.files = dt.files;
        isDnDFileSet.current = true;
      });
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const originalFile = event.target.files?.[0] || null;

    if (!originalFile) {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }

      setPreviewImage(null);
      form.setFieldValue("file", new File([], ""));
      return;
    }

    applyFile(originalFile);
  };

  const handlePreviewClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      noValidate
    >
      {formError && <FormMessage type="error" className="mb-4" text={formError} />}

      {tempModerationFlagged && !formError && (
        <FormMessage type="error" className="mb-4" text={UPLOAD_ERROR_MESSAGE.IMAGE_MODERATION_FLAGGED} />
      )}

      <input
        ref={setFileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      <form.Subscribe selector={(formState) => [formState.isSubmitting]}>
        {([isSubmitting]) => (
          <button
            type="button"
            className={twMerge("block w-full cursor-pointer", !isSubmitting && !isUploading && "mb-4")}
            onClick={handlePreviewClick}
            aria-label="画像を選択"
            disabled={isSubmitting || isUploading}
          >
            <motion.div
              initial={false}
              animate={
                isSubmitting || isUploading
                  ? {
                      scale: [0.98, 1.015, 0.99, 1.025, 0.985, 1.02, 0.98],
                      opacity: [0.3, 0.7, 0.85, 0.95, 1, 1, 1],
                      filter: [
                        "blur(8px)",
                        "blur(4px)",
                        "blur(2px)",
                        "blur(3px)",
                        "blur(1px)",
                        "blur(0.5px)",
                        "blur(0px)",
                      ],
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
              whileHover={!isSubmitting && !isUploading ? { scale: 1.05 } : undefined}
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
        )}
      </form.Subscribe>

      <form.Field name="file">
        {(field) =>
          field.state.meta.errors.length > 0 &&
          !field.state.meta.errorMap.onMount && (
            <FormMessage
              type="error"
              text={
                typeof field.state.meta.errors[0] === "string"
                  ? field.state.meta.errors[0]
                  : (field.state.meta.errors[0]?.message ?? "")
              }
            />
          )
        }
      </form.Field>

      <form.Subscribe selector={(formState) => [formState.canSubmit, formState.isSubmitting]}>
        {([canSubmit, isSubmitting]) => (
          <>
            <motion.div
              className="flex flex-col gap-4 overflow-hidden"
              animate={{
                opacity: isSubmitting || isUploading ? 0 : 1,
                height: isSubmitting || isUploading ? 0 : "auto",
              }}
              transition={DEFAULT_TRANSITION}
            >
              <form.Field name="title">
                {(field) => (
                  <Input
                    name={field.name}
                    type="text"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    label={
                      <>
                        タイトル
                        <span className="text-warm-black text-xs">(なくてもいいよ)</span>
                      </>
                    }
                    placeholder="すてきな画像"
                    error={
                      typeof field.state.meta.errors[0] === "string"
                        ? field.state.meta.errors[0]
                        : field.state.meta.errors[0]?.message
                    }
                    maxLength={MAX_TITLE_LENGTH}
                    currentLength={field.state.value?.length}
                    autoComplete="off"
                    disabled={isSubmitting || isUploading}
                  />
                )}
              </form.Field>

              <form.Field name="tags">
                {(field) => (
                  <TagInput
                    maxTags={MAX_TAG_COUNT}
                    maxTagTextLength={MAX_TAG_TEXT_LENGTH}
                    tags={field.state.value ?? []}
                    onChangeTags={field.handleChange}
                    placeholder="風景とか…"
                    suggestTags={[]}
                    disabled={isSubmitting || isUploading}
                    error={
                      typeof field.state.meta.errors[0] === "string"
                        ? field.state.meta.errors[0]
                        : field.state.meta.errors[0]?.message
                    }
                  />
                )}
              </form.Field>
            </motion.div>

            <FormSubmitButton
              className="mt-6 w-full"
              disabled={!canSubmit || isSubmitting || isUploading || tempModerationFlagged}
              isSubmitting={isSubmitting || isUploading}
              label="投稿"
              pendingLabel="投稿中…"
            />
          </>
        )}
      </form.Subscribe>
    </form>
  );
}
