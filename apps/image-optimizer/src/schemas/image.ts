import * as v from "valibot";

/** 最大ファイルサイズ（10MB） */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** 許可する画像MIMEタイプ */
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/avif"] as const;

/**
 * 画像ファイルのバリデーションスキーマ
 */
export const imageFormSchema = v.object({
  image: v.pipe(
    v.file("画像ファイルが必要です"),
    v.mimeType(ALLOWED_IMAGE_TYPES, "対応していない画像形式です"),
    v.maxSize(MAX_FILE_SIZE, `ファイルサイズは${MAX_FILE_SIZE / 1024 / 1024}MB以下である必要があります`),
  ),
});

export type ImageFormData = v.InferOutput<typeof imageFormSchema>;
