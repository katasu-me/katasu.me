import * as v from "valibot";

// 混同を避けるためにいくつか予約語にしておく
export const RESERVED_CUSTOM_URLS = [
  // 既存のルート
  "settings",
  "auth",
  "api",
  "report",
  "closed-beta",
  "404",
  // サブパスで使われているもの
  "image",
  "tag",
  "user",
];

export const MIN_CUSTOM_URL_LENGTH = 3;
export const MAX_CUSTOM_URL_LENGTH = 32;

const CUSTOM_URL_MIN_LENGTH_MESSAGE = `${MIN_CUSTOM_URL_LENGTH}文字以上で入力してください`;
const CUSTOM_URL_MAX_LENGTH_MESSAGE = `${MAX_CUSTOM_URL_LENGTH}文字以内で入力してください`;
const CUSTOM_URL_FORMAT_MESSAGE = "英数字、ハイフン、アンダースコアのみ使用できます";
const CUSTOM_URL_START_END_MESSAGE = "英数字で始まり、英数字で終わる必要があります";
const CUSTOM_URL_CONSECUTIVE_MESSAGE = "連続するハイフンやアンダースコアは使用できません";
const CUSTOM_URL_RESERVED_MESSAGE = "この文字列は使用できません";

export const customUrlSchema = v.pipe(
  v.string(),
  v.transform((value) => value.toLowerCase().trim()),
  v.minLength(MIN_CUSTOM_URL_LENGTH, CUSTOM_URL_MIN_LENGTH_MESSAGE),
  v.maxLength(MAX_CUSTOM_URL_LENGTH, CUSTOM_URL_MAX_LENGTH_MESSAGE),
  v.regex(/^[a-z0-9_-]+$/, CUSTOM_URL_FORMAT_MESSAGE),
  v.regex(/^[a-z0-9]/, CUSTOM_URL_START_END_MESSAGE),
  v.regex(/[a-z0-9]$/, CUSTOM_URL_START_END_MESSAGE),
  v.check((value) => !/(--|__)/.test(value), CUSTOM_URL_CONSECUTIVE_MESSAGE),
  v.check((value) => !RESERVED_CUSTOM_URLS.includes(value), CUSTOM_URL_RESERVED_MESSAGE),
);

export const optionalCustomUrlSchema = v.pipe(
  v.optional(v.string(), ""),
  v.transform((value) => value.trim()),
  v.union([
    v.pipe(
      v.string(),
      v.literal(""),
      v.transform(() => undefined),
    ),
    customUrlSchema,
  ]),
);
