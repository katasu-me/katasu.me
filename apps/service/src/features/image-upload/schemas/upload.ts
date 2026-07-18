import * as v from "valibot";
import {
  imageTagsSchema,
  imageTitleSchema,
  MAX_TAG_COUNT,
  MAX_TAG_TEXT_LENGTH,
  MAX_TITLE_LENGTH,
} from "@/schemas/image-form";

export { MAX_TAG_COUNT, MAX_TAG_TEXT_LENGTH, MAX_TITLE_LENGTH };

export const MAX_IMAGE_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MIN_THUMBHASH_LENGTH = 20;
export const MAX_THUMBHASH_LENGTH = 50;

const ALLOWED_IMAGE_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

const EMPTY_IMAGE_MESSAGE = "画像が選択されていないか、未対応の形式です";
const MAX_IMAGE_FILE_SIZE_MESSAGE = "画像サイズは10MB以下にしてください";
const ALLOWED_IMAGE_FILE_TYPES_MESSAGE = "JPEG、PNG、WebP形式の画像のみアップロードできます";
const THUMBHASH_LENGTH_MESSAGE = `ThumbHashは${MIN_THUMBHASH_LENGTH}〜${MAX_THUMBHASH_LENGTH}文字である必要があります`;
const TEMP_IMAGE_ID_MESSAGE = "画像IDの形式が不正です";

const imageFileSchema = v.pipe(
  v.file(EMPTY_IMAGE_MESSAGE),
  v.maxSize(MAX_IMAGE_FILE_SIZE, MAX_IMAGE_FILE_SIZE_MESSAGE),
  v.mimeType(ALLOWED_IMAGE_FILE_TYPES, ALLOWED_IMAGE_FILE_TYPES_MESSAGE),
);

// nanoid()のデフォルト（21文字、A-Za-z0-9_-）以外は不正値として弾く
const tempImageIdSchema = v.pipe(v.string(), v.regex(/^[A-Za-z0-9_-]{21}$/, TEMP_IMAGE_ID_MESSAGE));

export const uploadImageClientSchema = v.object({
  file: imageFileSchema,
  title: imageTitleSchema,
  tags: imageTagsSchema,
});

/** 先行アップロード（ファイル選択直後にtmpバケットへ転送）用 */
export const uploadTempImageServerSchema = v.object({
  file: imageFileSchema,
});

export const uploadImageServerSchema = v.object({
  tempImageId: tempImageIdSchema,
  title: imageTitleSchema,
  tags: imageTagsSchema,
  thumbhash: v.pipe(
    v.string(),
    v.minLength(MIN_THUMBHASH_LENGTH, THUMBHASH_LENGTH_MESSAGE),
    v.maxLength(MAX_THUMBHASH_LENGTH, THUMBHASH_LENGTH_MESSAGE),
  ),
});

export const deleteTempImageServerSchema = v.object({
  tempImageId: tempImageIdSchema,
});

export type UploadImageData = v.InferOutput<typeof uploadImageClientSchema>;
export type UploadImageFormData = v.InferInput<typeof uploadImageClientSchema>;
export type UploadImageServerData = v.InferOutput<typeof uploadImageServerSchema>;
