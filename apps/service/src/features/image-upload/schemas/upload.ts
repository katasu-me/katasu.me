import * as v from "valibot";
import {
  imageTagsSchema,
  imageTitleSchema,
  MAX_TAG_COUNT,
  MAX_TAG_TEXT_LENGTH,
  MAX_TITLE_LENGTH,
} from "@/schemas/image-form";

export { MAX_TITLE_LENGTH, MAX_TAG_COUNT, MAX_TAG_TEXT_LENGTH };

export const MAX_IMAGE_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MIN_THUMBHASH_LENGTH = 20;
export const MAX_THUMBHASH_LENGTH = 50;

const ALLOWED_IMAGE_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

const EMPTY_IMAGE_MESSAGE = "画像が選択されていないか、未対応の形式です";
const MAX_IMAGE_FILE_SIZE_MESSAGE = "画像サイズは10MB以下にしてください";
const ALLOWED_IMAGE_FILE_TYPES_MESSAGE = "JPEG、PNG、WebP形式の画像のみアップロードできます";
const THUMBHASH_LENGTH_MESSAGE = `ThumbHashは${MIN_THUMBHASH_LENGTH}〜${MAX_THUMBHASH_LENGTH}文字である必要があります`;

export const uploadImageClientSchema = v.object({
  file: v.pipe(
    v.file(EMPTY_IMAGE_MESSAGE),
    v.maxSize(MAX_IMAGE_FILE_SIZE, MAX_IMAGE_FILE_SIZE_MESSAGE),
    v.mimeType(ALLOWED_IMAGE_FILE_TYPES, ALLOWED_IMAGE_FILE_TYPES_MESSAGE),
  ),
  title: imageTitleSchema,
  tags: imageTagsSchema,
});

export const uploadImageServerSchema = v.object({
  ...uploadImageClientSchema.entries,
  thumbhash: v.pipe(
    v.string(),
    v.minLength(MIN_THUMBHASH_LENGTH, THUMBHASH_LENGTH_MESSAGE),
    v.maxLength(MAX_THUMBHASH_LENGTH, THUMBHASH_LENGTH_MESSAGE),
  ),
});

export type UploadImageData = v.InferOutput<typeof uploadImageClientSchema>;
export type UploadImageFormData = v.InferInput<typeof uploadImageClientSchema>;
export type UploadImageServerData = v.InferOutput<typeof uploadImageServerSchema>;
