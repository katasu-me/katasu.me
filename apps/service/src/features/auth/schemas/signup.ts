import { boolean, check, type InferInput, type InferOutput, object, pipe } from "valibot";
import { avatarSchema, usernameSchema } from "@/schemas/user";

export const signUpFormSchema = object({
  username: usernameSchema,
  avatar: avatarSchema,
  agreeToTerms: pipe(
    boolean(),
    check((value) => value === true, "利用規約への同意が必要です"),
  ),
  agreeToPrivacy: pipe(
    boolean(),
    check((value) => value === true, "プライバシーポリシーへの同意が必要です"),
  ),
});

export type SignUpFormData = InferOutput<typeof signUpFormSchema>;
export type SignUpFormInput = InferInput<typeof signUpFormSchema>;
