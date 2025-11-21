import * as v from "valibot";
import { avatarSchema, usernameSchema } from "@/schemas/user";

export const userSettingsFormSchema = v.object({
  username: usernameSchema,
  avatar: avatarSchema,
  removeAvatar: v.boolean(),
});

export type UserSettingsFormData = v.InferOutput<typeof userSettingsFormSchema>;
export type UserSettingsFormInput = v.InferInput<typeof userSettingsFormSchema>;
