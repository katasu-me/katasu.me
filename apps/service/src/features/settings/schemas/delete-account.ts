import * as v from "valibot";

export const CONFIRMATION_TEXT = "またね";

export const deleteAccountSchema = v.object({
  confirmation: v.pipe(v.string(), v.literal(CONFIRMATION_TEXT, "確認テキストが一致していません")),
});

export type DeleteAccountFormData = v.InferOutput<typeof deleteAccountSchema>;
export type DeleteAccountFormInput = v.InferInput<typeof deleteAccountSchema>;
