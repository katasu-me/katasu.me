import * as v from "valibot";

export const MAX_IMAGE_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export const MAX_TITLE_LENGTH = 100;
export const MAX_TAG_COUNT = 10;
export const MAX_TAG_TEXT_LENGTH = 20;

const EMPTY_IMAGE_MESSAGE = "画像が選択されていないか、未対応の形式です";
const MAX_IMAGE_FILE_SIZE_MESSAGE = "画像サイズは10MB以下にしてください";
const ALLOWED_IMAGE_FILE_TYPES_MESSAGE = "JPEG、PNG、WebP形式の画像のみアップロードできます";

const TITLE_MAX_LENGTH_MESSAGE = `タイトルは${MAX_TITLE_LENGTH}文字以内で入力してください`;
const TITLE_INVALID_MESSAGE = "タイトルに使用できない文字が含まれています";

const TAG_MAX_COUNT_MESSAGE = `タグは${MAX_TAG_COUNT}個以内で入力してください`;
const TAG_TEXT_MAX_LENGTH_MESSAGE = `タグは${MAX_TAG_TEXT_LENGTH}文字以内で入力してください`;

const INVALID_CHAR_REGEX = /^[^\p{Cc}\p{Cf}]+$/u;

export const uploadImageSchema = v.object({
  file: v.nullish(
    v.pipe(
      v.file(EMPTY_IMAGE_MESSAGE),
      v.maxSize(MAX_IMAGE_FILE_SIZE, MAX_IMAGE_FILE_SIZE_MESSAGE),
      v.mimeType(ALLOWED_IMAGE_FILE_TYPES, ALLOWED_IMAGE_FILE_TYPES_MESSAGE),
    ),
  ),
  title: v.optional(
    v.pipe(
      v.string(),
      v.transform((value) => value.trim()),
      v.regex(INVALID_CHAR_REGEX, TITLE_INVALID_MESSAGE),
      v.maxLength(MAX_TITLE_LENGTH, TITLE_MAX_LENGTH_MESSAGE),
    ),
  ),
  tags: v.optional(
    v.pipe(
      v.array(
        v.pipe(
          v.string(),
          v.transform((value) => value.trim()),
          v.regex(INVALID_CHAR_REGEX, TITLE_INVALID_MESSAGE),
          v.maxLength(MAX_TAG_TEXT_LENGTH, TAG_TEXT_MAX_LENGTH_MESSAGE),
        ),
      ),
      v.maxLength(MAX_TAG_COUNT, TAG_MAX_COUNT_MESSAGE),
    ),
  ),
});

export type UploadImageData = v.InferOutput<typeof uploadImageSchema>;
export type UploadImageFormData = v.InferInput<typeof uploadImageSchema>;
