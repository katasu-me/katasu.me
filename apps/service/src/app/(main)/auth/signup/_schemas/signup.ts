import * as v from "valibot";
import { avatarSchema, usernameSchema } from "@/schemas/user";

export const signUpFormSchema = v.object({
  username: usernameSchema,
  avatar: avatarSchema,
  agreeToTerms: v.literal("on"),
  agreeToPrivacy: v.literal("on"),
});
