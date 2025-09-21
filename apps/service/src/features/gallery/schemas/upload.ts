import * as v from "valibot";

const MAX_IMAGE_FILE_SIZE_MESSAGE = "ファイルサイズは10MB以下にしてください";
const ALLOWED_IMAGE_FILE_TYPES_MESSAGE = "JPEG、PNG、WebP形式のファイルのみアップロードできます";
const TITLE_MAX_LENGTH_MESSAGE = "タイトルは100文字以内で入力してください";
const TITLE_INVALID_MESSAGE = "タイトルに使用できない文字が含まれています";
const TAGS_MAX_LENGTH_MESSAGE = "タグは50文字以内で入力してください";

const MAX_IMAGE_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_TITLE_LENGTH = 100;
const MAX_TAGS_LENGTH = 50;

const INVALID_CHAR_REGEX = /[\p{Cc}\p{Cf}]/u;

export const uploadImageSchema = v.object({
  file: v.pipe(
    v.file(),
    v.maxSize(MAX_IMAGE_FILE_SIZE, MAX_IMAGE_FILE_SIZE_MESSAGE),
    v.mimeType(ALLOWED_IMAGE_FILE_TYPES, ALLOWED_IMAGE_FILE_TYPES_MESSAGE),
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
    v.array(
      v.pipe(
        v.string(),
        v.transform((value) => value.trim()),
        v.regex(INVALID_CHAR_REGEX, TITLE_INVALID_MESSAGE),
        v.maxLength(MAX_TAGS_LENGTH, TAGS_MAX_LENGTH_MESSAGE),
      ),
    ),
  ),
});

export type UploadImageData = v.InferOutput<typeof uploadImageSchema>;
