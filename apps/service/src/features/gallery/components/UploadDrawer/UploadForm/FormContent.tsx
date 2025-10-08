import { getInputProps, type useForm, type useInputControl } from "@conform-to/react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { useFormStatus } from "react-dom";
import { twMerge } from "tailwind-merge";
import type { InferOutput } from "valibot";
import Input from "@/components/Input";
import TagInput from "@/components/TagInput";
import { DEFAULT_TRANSITION } from "@/constants/animation";
import {
  MAX_TAG_COUNT,
  MAX_TAG_TEXT_LENGTH,
  MAX_TITLE_LENGTH,
  type uploadImageSchema,
} from "@/features/gallery/schemas/upload";
import FrameImage from "../../FrameImage";
import ImagePlaceholder from "../../ImagePlaceholder";
import { ErrorMessage } from "./ErrorMessage";
import type { PreviewImage } from "./index";
import SubmitButton from "./SubmitButton";

type Props = {
  previewImage: PreviewImage | null;
  handlePreviewClick: () => void;
  form: ReturnType<typeof useForm<InferOutput<typeof uploadImageSchema>>>[0];
  fields: ReturnType<typeof useForm<InferOutput<typeof uploadImageSchema>>>[1];
  tagInput: ReturnType<typeof useInputControl>;
  handleTagChange: (tags: string[]) => void;
  isFormValid: boolean;
  onPendingChange?: (pending: boolean) => void;
};

export default function FormContent({
  previewImage,
  handlePreviewClick,
  form,
  fields,
  tagInput,
  handleTagChange,
  isFormValid,
  onPendingChange,
}: Props) {
  const { pending } = useFormStatus();

  useEffect(() => {
    onPendingChange?.(pending);
  }, [pending, onPendingChange]);

  return (
    <>
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
      {form.errors && form.errors?.length > 0 && <ErrorMessage text={form.errors[0]} />}
      {fields.file.errors?.at(0) && <ErrorMessage text={fields.file.errors[0]} />}

      {/* タイトル・タグ入力欄 */}
      <motion.div
        className="flex flex-col gap-4 overflow-hidden"
        animate={{
          opacity: pending ? 0 : 1,
          height: pending ? 0 : "auto",
        }}
        transition={DEFAULT_TRANSITION}
      >
        {/* タイトル */}
        <Input
          {...getInputProps(fields.title, { type: "text" })}
          label={
            <>
              タイトル
              <span className="text-warm-black text-xs">（なくてもいいよ）</span>
            </>
          }
          placeholder="すてきな画像"
          error={fields.title.errors?.at(0)}
          maxLength={MAX_TITLE_LENGTH}
          currentLength={fields.title.value?.length ?? 0}
          autoComplete="off"
          disabled={pending}
        />

        {/* タグ */}
        <TagInput
          id={fields.tags.id}
          maxTags={MAX_TAG_COUNT}
          maxTagTextLength={MAX_TAG_TEXT_LENGTH}
          suggestTags={[]} // TODO: 後でサジェスト機能を実装する
          tags={(tagInput.value as string[]) || []}
          onChangeTags={handleTagChange}
          placeholder="風景とか…"
          error={fields.tags.errors?.at(0)}
          disabled={pending}
        />
      </motion.div>

      <SubmitButton disabled={!isFormValid} />
    </>
  );
}
