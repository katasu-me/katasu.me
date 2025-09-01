import * as v from "valibot";

const USERNAME_REQUIRED_MESSAGE = "ユーザー名を入力してください";
const USERNAME_MAX_LENGTH_MESSAGE = "ユーザー名は50文字以内で入力してください";
const USERNAME_INVALID_MESSAGE = "ユーザー名に使用できない文字が含まれています";
const AVATAR_FILE_SIZE_MESSAGE = "ファイルサイズは5MB以下にしてください";
const AVATAR_FILE_TYPE_MESSAGE = "JPEG、PNG、WebP形式のファイルのみアップロードできます";

export const MAX_USERNAME_LENGTH = 50;
export const MAX_AVATAR_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_AVATAR_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export const signUpFormSchema = v.object({
  username: v.pipe(
    v.string(USERNAME_REQUIRED_MESSAGE),
    v.transform((value) => value.trim()),
    v.nonEmpty(USERNAME_REQUIRED_MESSAGE),
    v.maxLength(MAX_USERNAME_LENGTH, USERNAME_MAX_LENGTH_MESSAGE),
    v.regex(/^[^\p{Cc}\p{Cf}]+$/u, USERNAME_INVALID_MESSAGE),
  ),
  avatar: v.optional(
    v.pipe(
      v.unknown(),
      v.transform((value) => {
        // 空のファイルやファイルが選択されていない場合はundefinedを返す
        if (!value || (value instanceof File && (value.size === 0 || value.name === ""))) {
          return undefined;
        }

        return value;
      }),
      v.union([
        v.undefined(),
        v.pipe(
          v.instance(File),
          v.maxSize(MAX_AVATAR_FILE_SIZE, AVATAR_FILE_SIZE_MESSAGE),
          v.mimeType(ALLOWED_AVATAR_FILE_TYPES, AVATAR_FILE_TYPE_MESSAGE),
        ),
      ]),
    ),
  ),
  agreeToTerms: v.literal("on"),
  agreeToPrivacy: v.literal("on"),
});

export type SignUpFormData = v.InferOutput<typeof signUpFormSchema>;
