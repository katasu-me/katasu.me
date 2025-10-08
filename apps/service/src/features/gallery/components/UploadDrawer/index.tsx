import { getFormProps, getInputProps, type SubmissionResult, useForm, useInputControl } from "@conform-to/react";
import { parseWithValibot } from "@conform-to/valibot";
import { useActionState, useEffect, useRef, useState } from "react";
import Drawer from "@/components/Drawer";
import { uploadAction } from "@/features/gallery/actions/upload";
import { uploadImageSchema } from "@/features/gallery/schemas/upload";
import type { PreviewImage } from "./UploadForm";
import FormContent from "./UploadForm/FormContent";

type Props = {
  defaultImageFile?: File;
  defaultTags?: string[];
  onSuccess?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const defaultResult: SubmissionResult<string[]> = {
  status: "error",
  error: {
    file: [""],
  },
};

function FormWrapper({
  defaultImageFile,
  defaultTags = [],
  onSuccess,
  onPendingChange,
}: Pick<Props, "defaultImageFile" | "defaultTags" | "onSuccess"> & {
  onPendingChange: (pending: boolean) => void;
}) {
  const [lastResult, action] = useActionState(uploadAction, undefined);
  const [previewImage, setPreviewImage] = useState<PreviewImage | null>(null);

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

  // React 19で送信後にフォームがリセットされる問題のワークアラウンド
  // @see https://github.com/edmundhung/conform/issues/681
  useEffect(() => {
    const preventDefault = (event: Event) => {
      if (event.target === document.forms.namedItem(form.id)) {
        event.preventDefault();
        setPreviewImage(null);
      }
    };

    document.addEventListener("reset", preventDefault, true);

    return () => {
      document.removeEventListener("reset", preventDefault, true);
    };
  }, [form.id]);

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

  const isFormValid = Object.values(form.allErrors).length === 0;

  return (
    <form {...getFormProps(form)} action={action} noValidate>
      <input
        {...getInputProps(fields.file, { type: "file" })}
        ref={setFileInputRef}
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
      <FormContent
        previewImage={previewImage}
        handlePreviewClick={handlePreviewClick}
        form={form}
        fields={fields}
        tagInput={tagInput}
        handleTagChange={handleTagChange}
        isFormValid={isFormValid}
        onPendingChange={onPendingChange}
      />
    </form>
  );
}

export default function UploadDrawer({ defaultImageFile, defaultTags, onSuccess, open, onOpenChange }: Props) {
  const [isPending, setIsPending] = useState(false);

  return (
    <Drawer title="投稿する" open={open} onOpenChange={onOpenChange} dismissible={!isPending}>
      {({ Description }) => (
        <>
          <Description hidden>新しい画像を投稿するフォーム</Description>
          <FormWrapper
            defaultImageFile={defaultImageFile}
            defaultTags={defaultTags}
            onSuccess={onSuccess}
            onPendingChange={setIsPending}
          />
        </>
      )}
    </Drawer>
  );
}
