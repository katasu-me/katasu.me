import * as v from "valibot";
import { avatarSchema, usernameSchema } from "./common";

export { ALLOWED_AVATAR_FILE_TYPES, MAX_USERNAME_LENGTH } from "./common";

export const signUpFormSchema = v.object({
  username: usernameSchema,
  avatar: avatarSchema,
  agreeToTerms: v.literal("on"),
  agreeToPrivacy: v.literal("on"),
});

export type SignUpFormData = v.InferOutput<typeof signUpFormSchema>;
