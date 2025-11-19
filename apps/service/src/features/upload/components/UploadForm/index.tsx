import { useForm } from "@tanstack/react-form";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import FormInputFields from "@/components/FormInputFields";
import FormMessage from "@/components/FormMessage";
import FormSubmitButton from "@/components/FormSubmitButton";
import FrameImage from "@/components/FrameImage";
import { DEFAULT_TRANSITION } from "@/constants/animation";
import { normalizeFile } from "@/features/form/libs/work-around";
import {
  MAX_TAG_COUNT,
  MAX_TAG_TEXT_LENGTH,
  MAX_TITLE_LENGTH,
  type UploadImageFormData,
  uploadImageSchema,
} from "@/features/upload/schemas/upload";
import { uploadFn } from "@/features/upload/server-fn/upload";
import ImagePlaceholder from "./ImagePlaceholder";

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

export default function UploadForm({
  isPending,
  onPendingChange,
  defaultImageFile,
  defaultTags = [],
  onSuccess,
}: Props) {
  const [previewImage, setPreviewImage] = useState<PreviewImage | null>(null);
  const [formError, setFormError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isDnDFileSet = useRef(false);

  const form = useForm({
    defaultValues: {
      file: null,
      title: "",
      tags: defaultTags,
    } as UploadImageFormData,
    validators: {
      onChange: uploadImageSchema,
    },
    onSubmit: async ({ value }) => {
      if (!value.file) {
        setFormError("画像が選択されていません");
        return;
      }

      onPendingChange(true);
      setFormError("");

      try {
        const formData = new FormData();
        formData.append("file", value.file);

        if (value.title) {
          formData.append("title", value.title);
        }

        if (value.tags && value.tags.length > 0) {
          formData.append("tags", JSON.stringify(value.tags));
        }

        const result = await uploadFn({ data: formData });

        if (result.success) {
          form.reset();
          setPreviewImage(null);
          onSuccess?.();
        } else {
          setFormError(result.error);
        }
      } catch (error) {
        setFormError(error instanceof Error ? error.message : "アップロードに失敗しました");
      } finally {
        onPendingChange(false);
      }
    },
  });

  // usePreventFormReset(JSON.stringify(form.options.defaultValues || {}), () => {
  //   setPreviewImage(null);
  // });

  // DnDで渡されたファイルをセット
  useEffect(() => {
    if (!defaultImageFile) {
      return;
    }

    normalizeFile(defaultImageFile).then((file) => {
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
      form.setFieldValue("file", file);
    });
  }, [defaultImageFile, form.setFieldValue]);

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
      setPreviewImage(null);
      form.setFieldValue("file", null);
      return;
    }

    const file = await normalizeFile(originalFile);

    if (fileInputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(file);
      fileInputRef.current.files = dt.files;
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
    form.setFieldValue("file", file);
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

      <input
        ref={setFileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

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
                  scale: [0.98, 1.015, 0.99, 1.025, 0.985, 1.02, 0.98],
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

      <form.Field name="file">
        {(field) =>
          field.state.meta.errors.length > 0 && (
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

      <form.Field name="title">
        {(titleField) => (
          <form.Field name="tags">
            {(tagsField) => (
              <motion.div
                className="flex flex-col gap-4 overflow-hidden"
                animate={{
                  opacity: isPending ? 0 : 1,
                  height: isPending ? 0 : "auto",
                }}
                transition={DEFAULT_TRANSITION}
              >
                <FormInputFields
                  title={{
                    name: titleField.name,
                    value: titleField.state.value ?? "",
                    error:
                      typeof titleField.state.meta.errors[0] === "string"
                        ? titleField.state.meta.errors[0]
                        : titleField.state.meta.errors[0]?.message,
                    onChange: titleField.handleChange,
                    onBlur: titleField.handleBlur,
                  }}
                  tags={{
                    value: tagsField.state.value ?? [],
                    error:
                      typeof tagsField.state.meta.errors[0] === "string"
                        ? tagsField.state.meta.errors[0]
                        : tagsField.state.meta.errors[0]?.message,
                    onChange: tagsField.handleChange,
                  }}
                  titlePlaceholder="すてきな画像"
                  tagPlaceholder="風景とか…"
                  maxTitleLength={MAX_TITLE_LENGTH}
                  maxTagCount={MAX_TAG_COUNT}
                  maxTagTextLength={MAX_TAG_TEXT_LENGTH}
                  disabled={isPending}
                />
              </motion.div>
            )}
          </form.Field>
        )}
      </form.Field>

      <form.Subscribe selector={(state) => [state.canSubmit]}>
        {([canSubmit]) => (
          <FormSubmitButton
            className="mt-6 w-full"
            disabled={!canSubmit || isPending}
            label="投稿"
            pendingLabel="投稿中…"
          />
        )}
      </form.Subscribe>
    </form>
  );
}
