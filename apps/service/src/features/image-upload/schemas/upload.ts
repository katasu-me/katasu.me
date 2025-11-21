import * as v from "valibot";
import {
  imageTagsSchema,
  imageTitleSchema,
  MAX_TAG_COUNT,
  MAX_TAG_TEXT_LENGTH,
  MAX_TITLE_LENGTH,
} from "@/schemas/image-form";

export { MAX_TITLE_LENGTH, MAX_TAG_COUNT, MAX_TAG_TEXT_LENGTH };

// 画像ファイル関連の定数
export const MAX_IMAGE_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

// 画像ファイル関連のバリデーションメッセージ
const EMPTY_IMAGE_MESSAGE = "画像が選択されていないか、未対応の形式です";
const MAX_IMAGE_FILE_SIZE_MESSAGE = "画像サイズは10MB以下にしてください";
const ALLOWED_IMAGE_FILE_TYPES_MESSAGE = "JPEG、PNG、WebP形式の画像のみアップロードできます";

export const uploadImageSchema = v.object({
  file: v.pipe(
    v.file(EMPTY_IMAGE_MESSAGE),
    v.maxSize(MAX_IMAGE_FILE_SIZE, MAX_IMAGE_FILE_SIZE_MESSAGE),
    v.mimeType(ALLOWED_IMAGE_FILE_TYPES, ALLOWED_IMAGE_FILE_TYPES_MESSAGE),
  ),
  title: imageTitleSchema,
  tags: imageTagsSchema,
});

export type UploadImageData = v.InferOutput<typeof uploadImageSchema>;
export type UploadImageFormData = v.InferInput<typeof uploadImageSchema>;
