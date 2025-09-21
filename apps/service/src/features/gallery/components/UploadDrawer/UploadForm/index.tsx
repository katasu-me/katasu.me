import { getFormProps, getInputProps, type SubmissionResult, useForm, useInputControl } from "@conform-to/react";
import { parseWithValibot } from "@conform-to/valibot";
import { type ComponentProps, useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import Button from "@/components/Button";
import Input from "@/components/Input";
import TagInput from "@/components/TagInput";
import { uploadAction } from "@/features/gallery/actions/upload";
import {
  MAX_TAG_COUNT,
  MAX_TAG_TEXT_LENGTH,
  MAX_TITLE_LENGTH,
  uploadImageSchema,
} from "@/features/gallery/schemas/upload";
import FrameImage from "../../FrameImage";
import ImagePlaceholder from "../../ImagePlaceholder";

const defaultResult: SubmissionResult<string[]> = {
  status: "error",
  error: {
    file: [""],
  },
};

function SubmitButton({ disabled }: Pick<ComponentProps<"button">, "disabled">) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="mt-8 w-full" variant="fill" disabled={disabled || pending}>
      {pending ? "投稿中..." : "投稿"}
    </Button>
  );
}

type Props = {
  defaultImageFile?: File;
};

export default function UploadForm({ defaultImageFile }: Props) {
  const [lastResult, action] = useActionState(uploadAction, undefined);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageInfo, setImageInfo] = useState<{ width: number; height: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isDnDFileSet = useRef(false);

  const [form, fields] = useForm({
    lastResult: lastResult || defaultResult,
    defaultValue: {
      tags: [] as string[],
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    onValidate({ formData }) {
      return parseWithValibot(formData, {
        schema: uploadImageSchema,
      });
    },
  });

  const tagInput = useInputControl(fields.tags);

  // DnDで渡された画像ファイルがあればプレビューにセット
  useEffect(() => {
    if (defaultImageFile) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();
        const imageSrc = e.target?.result as string;

        img.onload = () => {
          setImageSrc(imageSrc);
          setImageInfo({ width: img.width, height: img.height });
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

      isDnDFileSet.current = true;
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;

    // 画像が選択されなかった場合はリセット
    if (!file) {
      setImageSrc(null);
      setImageInfo(null);
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      const imageSrc = e.target?.result as string;

      img.onload = () => {
        setImageSrc(imageSrc);
        setImageInfo({ width: img.width, height: img.height });
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

  const imageClassname =
    "h-48 pc:w-auto w-full rotate-[1deg] transition-transform duration-400 ease-magnetic hover:scale-105";

  return (
    <>
      {/* 画像のプレビュー */}
      <button
        type="button"
        className="mx-auto mb-4 block cursor-pointer"
        onClick={handlePreviewClick}
        aria-label="画像を選択"
      >
        {imageSrc ? (
          <FrameImage
            src={imageSrc}
            width={imageInfo?.width || 2560}
            height={imageInfo?.height || 1440}
            alt="画像のプレビュー"
            className={imageClassname}
          />
        ) : (
          <ImagePlaceholder className={imageClassname} />
        )}
      </button>

      <form {...getFormProps(form)} action={action} noValidate>
        {/* 画像 */}
        <input
          {...getInputProps(fields.file, { type: "file" })}
          ref={setFileInputRef}
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
        {fields.file.errors?.at(0) && (
          <p className="mb-4 text-center text-red-600 text-sm">{fields.file.errors.at(0)}</p>
        )}

        {/* タイトル */}
        <Input
          {...getInputProps(fields.title, { type: "text" })}
          label={
            <>
              タイトル
              <span className="text-warm-black text-xs">（なくてもいいよ）</span>
            </>
          }
          placeholder="タイトルを入力"
          error={fields.title.errors?.at(0)}
          maxLength={MAX_TITLE_LENGTH}
          currentLength={fields.title.value?.length ?? 0}
          autoComplete="off"
        />

        {/* タグ */}
        <TagInput
          id={fields.tags.id}
          maxTags={MAX_TAG_COUNT}
          maxTagTextLength={MAX_TAG_TEXT_LENGTH}
          suggestTags={[]} // TODO: 後でサジェスト機能を実装する
          tags={(tagInput.value as string[]) || []}
          onChangeTags={handleTagChange}
          placeholder="タグを追加"
          error={fields.tags.errors?.at(0)}
        />

        <SubmitButton disabled={!isFormValid} />
      </form>
    </>
  );
}
