import * as v from "valibot";
import { MAX_IMAGE_FILE_SIZE } from "@/features/gallery/schemas/upload";

const USERNAME_REQUIRED_MESSAGE = "ユーザー名を入力してください";
const USERNAME_MAX_LENGTH_MESSAGE = "ユーザー名は50文字以内で入力してください";
const USERNAME_INVALID_MESSAGE = "ユーザー名に使用できない文字が含まれています";
const AVATAR_FILE_SIZE_MESSAGE = "ファイルサイズは10MB以下にしてください";
const AVATAR_FILE_TYPE_MESSAGE = "JPEG、PNG、GIF形式のファイルのみアップロードできます";

export const MAX_USERNAME_LENGTH = 50;
export const ALLOWED_AVATAR_FILE_TYPES = ["image/jpeg", "image/png", "image/gif"] as const;

export const usernameSchema = v.pipe(
  v.string(USERNAME_REQUIRED_MESSAGE),
  v.transform((value) => value.trim()),
  v.nonEmpty(USERNAME_REQUIRED_MESSAGE),
  v.maxLength(MAX_USERNAME_LENGTH, USERNAME_MAX_LENGTH_MESSAGE),
  v.regex(/^[^\p{Cc}\p{Cf}]+$/u, USERNAME_INVALID_MESSAGE),
);

export const avatarSchema = v.pipe(
  v.file(),
  v.maxSize(MAX_IMAGE_FILE_SIZE, AVATAR_FILE_SIZE_MESSAGE),
  v.check(
    (file) =>
      file.size === 0 || ALLOWED_AVATAR_FILE_TYPES.includes(file.type as (typeof ALLOWED_AVATAR_FILE_TYPES)[number]),
    AVATAR_FILE_TYPE_MESSAGE,
  ),
  v.transform((file) => (file.size === 0 ? undefined : file)),
);
