import { getInputProps, type useForm, type useInputControl } from "@conform-to/react";
import { motion } from "motion/react";
import { useFormStatus } from "react-dom";
import { twMerge } from "tailwind-merge";
import type { InferOutput } from "valibot";
import IconExclamationCircle from "@/assets/icons/exclamation-circle.svg";
import Input from "@/components/Input";
import TagInput from "@/components/TagInput";
import { DEFAULT_TRANSITION } from "@/constants/animation";
import {
  type editImageSchema,
  MAX_TAG_COUNT,
  MAX_TAG_TEXT_LENGTH,
  MAX_TITLE_LENGTH,
} from "@/features/gallery/schemas/edit";
import FrameImage from "../../FrameImage";
import SubmitButton from "./SubmitButton";

type Props = {
  imageSrc: string;
  imageWidth: number;
  imageHeight: number;
  form: ReturnType<typeof useForm<InferOutput<typeof editImageSchema>>>[0];
  fields: ReturnType<typeof useForm<InferOutput<typeof editImageSchema>>>[1];
  tagInput: ReturnType<typeof useInputControl>;
  handleTagChange: (tags: string[]) => void;
  isFormValid: boolean;
};

export default function EditFormContent({
  imageSrc,
  imageWidth,
  imageHeight,
  form,
  fields,
  tagInput,
  handleTagChange,
  isFormValid,
}: Props) {
  const { pending } = useFormStatus();

  return (
    <>
      {/* 画像のプレビュー */}
      <div className={twMerge("w-full", !pending && "mb-6")}>
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
          transition={DEFAULT_TRANSITION}
        >
          <FrameImage
            src={imageSrc}
            width={imageWidth || 2560}
            height={imageHeight || 1440}
            alt="画像のプレビュー"
            className={twMerge("mx-auto", imageWidth > imageHeight ? "h-auto w-full" : "max-h-64 w-auto")}
          />
        </motion.div>
      </div>

      {/* フォーム全体のエラー */}
      {form.errors && form.errors.length > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-600 bg-red-50 p-4">
          <IconExclamationCircle className="size-6 text-red-600" />
          <p className="text-red-600 text-sm">{form.errors[0]}</p>
        </div>
      )}

      {/* タイトル・タグ入力欄 */}
      <motion.div
        className="overflow-hidden"
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
              <span className="text-warm-black text-xs">(なくてもいいよ)</span>
            </>
          }
          placeholder="タイトルを入力"
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
          placeholder="タグを追加"
          error={fields.tags.errors?.at(0)}
          disabled={pending}
        />
      </motion.div>

      <SubmitButton disabled={!isFormValid} />
    </>
  );
}
