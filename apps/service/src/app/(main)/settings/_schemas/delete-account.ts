import * as v from "valibot";

export const ERROR_CONFIRMATION_TEXT_EMPTY = "確認テキストを入力してください";
export const CONFIRMATION_TEXT = "またね";

export const deleteAccountSchema = v.object({
  confirmation: v.pipe(
    v.string(ERROR_CONFIRMATION_TEXT_EMPTY),
    v.nonEmpty(ERROR_CONFIRMATION_TEXT_EMPTY),
    v.literal(CONFIRMATION_TEXT, `「${CONFIRMATION_TEXT}」と入力してください`),
  ),
});
