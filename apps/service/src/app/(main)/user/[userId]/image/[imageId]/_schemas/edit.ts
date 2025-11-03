import * as v from "valibot";

export const MAX_TITLE_LENGTH = 100;
export const MAX_TAG_COUNT = 10;
export const MAX_TAG_TEXT_LENGTH = 20;

const TITLE_MAX_LENGTH_MESSAGE = `タイトルは${MAX_TITLE_LENGTH}文字以内で入力してください`;
const TITLE_INVALID_MESSAGE = "タイトルに使用できない文字が含まれています";

const TAG_MAX_COUNT_MESSAGE = `タグは${MAX_TAG_COUNT}個以内で入力してください`;
const TAG_TEXT_MAX_LENGTH_MESSAGE = `タグは${MAX_TAG_TEXT_LENGTH}文字以内で入力してください`;

const INVALID_CHAR_REGEX = /^[^\p{Cc}\p{Cf}]+$/u;

export const editImageSchema = v.object({
  imageId: v.pipe(v.string(), v.nonEmpty("画像IDが指定されていません")),
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

export type EditImageData = v.InferOutput<typeof editImageSchema>;
